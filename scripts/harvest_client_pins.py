"""
Walk ES Client Work/<client>/, find the best project-scope shapefile per client,
and emit a JSONC list of {name, lat, lon, source, confidence} for review.

Heuristics
- Prefer shapefiles whose stem contains one of PREFERRED_TOKENS (claim, property,
  tenure, project, boundary, license, licence, permit, ml, pl, area, outline).
- Penalize shapefiles whose stem contains AVOID_TOKENS (geology, terrane,
  contour, grid, drill, sample, road, ddh, anomaly, region, bedrock).
- Among tied candidates, pick the one with the *smallest* bbox diagonal in
  metres (project-scale > regional-scale).
- Reject candidates whose bbox diagonal after WGS84 projection spans more than
  ~800 km — those are almost certainly regional basemaps, not a project extent.
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import shapefile  # pyshp
from pyproj import CRS, Transformer
from pyproj.exceptions import CRSError

ROOT = Path(r"x:\ESOS\ES Client Work")
OUT  = Path(r"x:\ESOS\src\_data\projects.proposed.jsonc")

PREFERRED_TOKENS = (
    "claim", "property", "tenure", "project", "boundary",
    "license", "licence", "permit", "outline", "area",
    "block", "lease", "concession", "ml_", "pl_",
)
AVOID_TOKENS = (
    "geology", "terrane", "contour", "grid", "drill", "ddh",
    "sample", "assay", "road", "bedrock", "region", "mag_",
    "magnetic", "radiometric", "dem", "hillshade", "anomaly",
    "target", "stream", "lithology", "fault", "terrain",
    "basemap", "topo", "world", "province", "watershed",
    "hotosm", "canvec", "natural_earth", "osm_", "ritual",
    "cultural", "blocked_passage", "geo_export_", "mi_project_ref",
    "competitor", "seapl_", "large_and_small_mine",
)

# Biggest plausible single-project extent in WGS84 degrees (~220 km at mid-lat)
MAX_DEGREE_SPAN = 2.0
# Also reject candidates bigger than this in native metres (regional basemaps)
MAX_BBOX_DIAG_M = 300_000


def score(stem: str, bbox_diag_m: float) -> tuple[int, float]:
    s = stem.lower()
    pref = any(tok in s for tok in PREFERRED_TOKENS)
    avoid = any(tok in s for tok in AVOID_TOKENS)
    tier = 0 if pref and not avoid else (1 if not avoid else 2)
    return (tier, bbox_diag_m)


def read_prj(shp: Path) -> CRS | None:
    prj = shp.with_suffix(".prj")
    if not prj.exists():
        return None
    try:
        return CRS.from_wkt(prj.read_text(encoding="utf-8", errors="ignore"))
    except (CRSError, OSError):
        return None


def bbox_diag_metres(crs: CRS, bbox: tuple[float, float, float, float]) -> float:
    xmin, ymin, xmax, ymax = bbox
    if crs.is_projected:
        unit = (crs.axis_info[0].unit_name or "").lower() if crs.axis_info else ""
        scale = 1.0 if "metre" in unit or "meter" in unit else 0.3048  # feet fallback
        return math.hypot((xmax - xmin) * scale, (ymax - ymin) * scale)
    # geographic: rough metres via midlat
    midlat = (ymin + ymax) / 2
    mx = (xmax - xmin) * 111320 * math.cos(math.radians(midlat))
    my = (ymax - ymin) * 111320
    return math.hypot(mx, my)


def centroid_wgs84(shp: Path) -> tuple[float, float, float] | None:
    """Return (lon, lat, bbox_span_deg) or None on failure."""
    crs = read_prj(shp)
    if crs is None:
        return None
    try:
        r = shapefile.Reader(str(shp))
        bbox = r.bbox  # (xmin, ymin, xmax, ymax) in native CRS
    except Exception:
        return None
    if not bbox or any(v is None for v in bbox):
        return None
    xmin, ymin, xmax, ymax = bbox
    cx, cy = (xmin + xmax) / 2, (ymin + ymax) / 2
    try:
        to_wgs = Transformer.from_crs(crs, "EPSG:4326", always_xy=True)
        lon, lat = to_wgs.transform(cx, cy)
        lon_min, lat_min = to_wgs.transform(xmin, ymin)
        lon_max, lat_max = to_wgs.transform(xmax, ymax)
    except Exception:
        return None
    if not (math.isfinite(lon) and math.isfinite(lat)):
        return None
    # Reject "null island" — transforms that collapse to (0,0) mean the source
    # CRS is a local grid pyproj could not resolve against WGS84.
    if abs(lon) < 0.5 and abs(lat) < 0.5:
        return None
    span = max(abs(lon_max - lon_min), abs(lat_max - lat_min))
    return (lon, lat, span)


def pick_for_client(client_dir: Path) -> dict | None:
    shps = list(client_dir.rglob("*.shp"))
    if not shps:
        return None

    scored = []
    for shp in shps:
        crs = read_prj(shp)
        if crs is None:
            continue
        try:
            r = shapefile.Reader(str(shp))
            bbox = r.bbox
        except Exception:
            continue
        if not bbox or not all(isinstance(v, (int, float)) and math.isfinite(v) for v in bbox):
            continue
        try:
            diag_m = bbox_diag_metres(crs, tuple(bbox))
        except (ValueError, OverflowError):
            continue
        if not math.isfinite(diag_m):
            continue
        # Skip regional basemaps — single projects rarely exceed 300 km diagonal
        if diag_m > MAX_BBOX_DIAG_M:
            continue
        scored.append((score(shp.stem, diag_m), shp))

    if not scored:
        return None

    scored.sort(key=lambda x: x[0])
    for (tier, diag), shp in scored:
        res = centroid_wgs84(shp)
        if res is None:
            continue
        lon, lat, span_deg = res
        if span_deg > MAX_DEGREE_SPAN:
            continue
        confidence = "high" if tier == 0 else ("medium" if tier == 1 else "low")
        rel = shp.relative_to(ROOT).as_posix()
        # Flag landings that should prompt manual review:
        # * lat near 0 (transform collapsed to equator)
        # * confidence low (no preferred-token file existed)
        # * bbox over 100 km (likely regional, not project-scale)
        flags = []
        if abs(lat) < 0.5:
            flags.append("equator-suspect")
        if confidence == "low":
            flags.append("generic-filename")
        if diag > 100_000:
            flags.append("wide-extent")
        rec = {
            "name": client_dir.name,
            "lat": round(lat, 4),
            "lon": round(lon, 4),
            "source": rel,
            "confidence": confidence,
            "bbox_span_km": round(diag / 1000, 1),
        }
        if flags:
            rec["review"] = flags
        return rec
    return None


def main() -> int:
    if not ROOT.exists():
        print(f"missing {ROOT}", file=sys.stderr)
        return 1

    clients = sorted(p for p in ROOT.iterdir() if p.is_dir() and not p.name.startswith(("-", ".")))
    hits: list[dict] = []
    misses: list[str] = []

    for i, c in enumerate(clients, 1):
        print(f"[{i:>3}/{len(clients)}] {c.name}", file=sys.stderr)
        rec = pick_for_client(c)
        if rec:
            hits.append(rec)
        else:
            misses.append(c.name)

    header = (
        "// Harvested project pins — review before promoting to projects.json.\n"
        f"// Clients scanned: {len(clients)}   Matched: {len(hits)}   Missed: {len(misses)}\n"
        "// Each entry: { name, lat, lon, source, confidence, bbox_span_km }\n"
        "// confidence = high (name matched claim/property/tenure keyword),\n"
        "//              medium (neutral name),\n"
        "//              low   (only avoid-flagged shapefiles existed).\n"
        f"// MISSED ({len(misses)}): {', '.join(misses)}\n"
    )
    body = json.dumps(hits, indent=2, ensure_ascii=False)
    OUT.write_text(header + body + "\n", encoding="utf-8")
    print(f"wrote {OUT}  (hits {len(hits)}, misses {len(misses)})", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
