"""
Promote src/_data/projects.proposed.jsonc -> src/_data/projects.json

- Strips // comments and metadata fields (source, confidence, bbox_span_km, review)
- Adds href: "contact.html" to every entry
- Appends any clients from the existing projects.json that aren't in the proposal
  (so we keep Black Rock Silver, Ekometall, etc. from the original 4 pins)
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT     = Path(r"x:\ESOS\src\_data")
PROPOSAL = ROOT / "projects.proposed.jsonc"
CURRENT  = ROOT / "projects.json"
OUT      = ROOT / "projects.json"


def parse_jsonc(text: str):
    # Strip // line comments (naive — fine for this file; no strings contain //)
    stripped = re.sub(r"//[^\n]*", "", text)
    return json.loads(stripped)


def main() -> int:
    proposal = parse_jsonc(PROPOSAL.read_text(encoding="utf-8"))
    current  = json.loads(CURRENT.read_text(encoding="utf-8"))

    names_in_proposal = {p["name"].lower() for p in proposal}
    merged = []
    for p in proposal:
        merged.append({
            "name": p["name"],
            "lat":  p["lat"],
            "lon":  p["lon"],
            "href": "contact.html",
        })
    # Preserve original pins that the harvester missed
    for c in current:
        if c["name"].lower() not in names_in_proposal:
            merged.append({
                "name": c["name"],
                "lat":  c["lat"],
                "lon":  c["lon"],
                "href": c.get("href", "contact.html"),
            })

    OUT.write_text(json.dumps(merged, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {OUT}  ({len(merged)} pins)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
