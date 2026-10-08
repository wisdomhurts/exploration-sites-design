# Saves the secret checkout settings to Vercel (Production) without printing them.
#
#   1. Stripe secret key            -> STRIPE_SECRET_KEY      (you paste it)
#   2. Stripe webhook + its secret  -> STRIPE_WEBHOOK_SECRET  (created here, never shown)
#   3. Resend API key (optional)    -> RESEND_API_KEY         (you paste it)
#   4. Sender address for emails    -> EMAIL_FROM
#
# Run from the repo root in PowerShell:   .\scripts\setup-stripe-secrets.ps1
# Requires: vercel CLI (logged in, folder linked) and stripe CLI (logged in).
param(
  [string]$SiteUrl = 'https://es-draft-1.vercel.app'
)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

function Read-Secret([string]$prompt) {
  $s = Read-Host $prompt -AsSecureString
  $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  try { ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)).Trim() } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
}

function Save-Var([string]$name, [string]$value, [switch]$Plain) {
  $flag = if ($Plain) { '--no-sensitive' } else { '--sensitive' }
  $value | vercel env add $name production --force $flag *> $null
  if ($LASTEXITCODE -ne 0) { throw "vercel env add $name failed" }
  Write-Host "  saved $name" -ForegroundColor Green
}

Write-Host "`n1) Stripe secret key" -ForegroundColor Cyan
Write-Host "   Stripe Dashboard > Developers > API keys > Secret key (starts sk_live_)."
$sk = Read-Secret '   Paste it (input is hidden)'
if ($sk -notmatch '^(sk|rk)_(live|test)_' -or $sk.Length -lt 50) { throw "That does not look like a full Stripe secret key ($($sk.Length) characters; a full key is 100+). Nothing was saved." }
Save-Var STRIPE_SECRET_KEY $sk
$mode = if ($sk -match '_live_') { '--live' } else { $null }

Write-Host "`n2) Stripe webhook -> $SiteUrl/api/stripe-webhook" -ForegroundColor Cyan
$hookUrl = "$SiteUrl/api/stripe-webhook"
$existing = ((stripe webhook_endpoints list $mode --limit 100 2>$null) -join "`n" | ConvertFrom-Json).data | Where-Object { $_.url -eq $hookUrl }
if ($existing) {
  Write-Host "   A webhook for this URL already exists ($($existing.id)). Its signing secret can't be read back;" -ForegroundColor Yellow
  Write-Host "   if STRIPE_WEBHOOK_SECRET isn't set yet, delete that webhook in the Stripe Dashboard and re-run." -ForegroundColor Yellow
} else {
  $cliArgs = @('webhook_endpoints', 'create', '--url', $hookUrl,
    '--enabled-events', 'checkout.session.completed',
    '--enabled-events', 'invoice.payment_failed',
    '--enabled-events', 'customer.subscription.deleted',
    '-d', 'description=Exploration Sites website - NRMP checkout notifications')
  if ($mode) { $cliArgs += $mode }
  $hook = (& stripe @cliArgs 2>$null) -join "`n" | ConvertFrom-Json
  if (-not $hook.secret) { throw 'Webhook creation failed.' }
  Save-Var STRIPE_WEBHOOK_SECRET $hook.secret
  Write-Host "   webhook $($hook.id) created"
}

Write-Host "`n3) Resend API key (for order emails to accounts@explorationsites.com)" -ForegroundColor Cyan
Write-Host "   resend.com > API Keys. Press Enter to skip if you don't have one yet."
$rk = Read-Secret '   Paste it (input is hidden)'
if ($rk) { Save-Var RESEND_API_KEY $rk } else { Write-Host '   skipped' -ForegroundColor Yellow }

Write-Host "`n4) Sender address for those emails (domain must be verified in Resend)" -ForegroundColor Cyan
$from = Read-Host '   Press Enter for "Exploration Sites <billing@explorationsites.com>", or type another'
if (-not $from) { $from = 'Exploration Sites <billing@explorationsites.com>' }
Save-Var EMAIL_FROM $from -Plain

Write-Host "`nDone. Tell Claude so it can redeploy and verify." -ForegroundColor Cyan
