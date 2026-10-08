# Launch-day switch for www.explorationsites.com (run AFTER the DNS change).
#
#   powershell -ExecutionPolicy Bypass -File scripts\launch-switch.ps1
#
# 1. Refuses to run until explorationsites.com and www both resolve to Vercel.
# 2. Points the three live NRMP Stripe Payment Links' post-payment redirect at
#    the real domain (they point at es-draft-1.vercel.app until launch).
# 3. Smoke-tests the key pages, robots.txt and sitemap on the real domain.
#
# SITE_URL=https://www.explorationsites.com is already set in Vercel (2026-10-08),
# so canonicals / sitemap / OG URLs are correct the moment DNS moves.
# Still manual in the Stripe dashboard: Settings > Public details > Terms of
# service URL -> https://www.explorationsites.com/terms.html

$ErrorActionPreference = 'Stop'
$Domain = 'https://www.explorationsites.com'
$VercelIp = '76.76.21.21'
$Links = @(
  'plink_1TrJn3ACd7y0Xr0vfZDTVsTr',  # Cadence
  'plink_1TrJn3ACd7y0Xr0v8Q6qrEgD',  # Active Drill
  'plink_1TrJn4ACd7y0Xr0v5LfXepvU'   # Full Program
)

Write-Host "1) Checking DNS..."
$apex = (Resolve-DnsName explorationsites.com -Type A -Server 8.8.8.8 -ErrorAction SilentlyContinue | Where-Object { $_.Type -eq 'A' }).IPAddress
$www  = Resolve-DnsName www.explorationsites.com -Server 8.8.8.8 -ErrorAction SilentlyContinue
$wwwA = ($www | Where-Object { $_.Type -eq 'A' }).IPAddress
$wwwCname = ($www | Where-Object { $_.Type -eq 'CNAME' }).NameHost
Write-Host "   apex A: $apex   www: $($wwwCname) $($wwwA)"
$apexOk = $apex -contains $VercelIp
$wwwOk  = ($wwwA -contains $VercelIp) -or ($wwwCname -match 'vercel')
if (-not ($apexOk -and $wwwOk)) {
  Write-Host "   DNS is not on Vercel yet (apex -> $VercelIp; www -> $VercelIp or cname.vercel-dns.com). Nothing changed." -ForegroundColor Yellow
  exit 1
}

Write-Host "2) Updating Stripe Payment Link redirects -> $Domain/checkout-success.html"
foreach ($id in $Links) {
  stripe post "/v1/payment_links/$id" --live `
    -d "after_completion[type]=redirect" `
    -d "after_completion[redirect][url]=$Domain/checkout-success.html" | Out-Null
  Write-Host "   $id updated"
}

Write-Host "3) Smoke test"
foreach ($p in '/', '/services.html', '/engagement.html', '/news-release-map-program.html', '/book.html', '/contact.html', '/robots.txt', '/sitemap.xml') {
  try { $r = Invoke-WebRequest -UseBasicParsing "$Domain$p" -MaximumRedirection 5; Write-Host ("   {0} {1}" -f $r.StatusCode, $p) }
  catch { Write-Host ("   FAIL {0}: {1}" -f $p, $_.Exception.Message) -ForegroundColor Red }
}
$apexRedirect = try { (Invoke-WebRequest -UseBasicParsing 'https://explorationsites.com/' -MaximumRedirection 0 -ErrorAction Stop).StatusCode } catch { $_.Exception.Response.StatusCode.value__ }
Write-Host "   apex redirect status: $apexRedirect (expect 308 -> www)"
Write-Host "Done. Remaining manual: Stripe Terms URL, GoHighLevel redirect to $Domain/booking-confirmed.html, Search Console sitemap."
