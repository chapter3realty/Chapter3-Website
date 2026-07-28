# indexnow.ps1 - tell Bing (and Yandex, Naver, Seznam) that pages changed.
#
# IndexNow is a ping, not a request. One POST covers every URL. Unlike Google
# Search Console there is no per-URL quota to burn.
#
# The key is NOT a secret. The protocol verifies you by requiring the key to be
# published at your domain root, so it is public by design. This script reads it
# from that same published file so there is one source of truth and the script
# cannot drift from what is deployed.
#
#   .\indexnow.ps1              submit every URL in sitemap.xml
#   .\indexnow.ps1 -Recent 15   submit only the 15 most recently changed
#   .\indexnow.ps1 -WhatIf      show what would be sent, send nothing
#
# Run it AFTER deploying. Submitting a URL whose new content is not live yet
# just gets the old version fetched.

param(
  [int]$Recent = 0,
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot 'chapter3realty'
$host_ = 'chapter3realty.com'

# The key file is named after the key itself; find it rather than hard-coding.
# Never Select-First on this. A second key file appeared once and the script
# silently picked the wrong one, which would have submitted under a key Bing
# had never validated. If there is any ambiguity, stop and make a human choose.
$keyFiles = @(Get-ChildItem -Path $root -Filter '*.txt' |
  Where-Object { $_.BaseName -match '^[0-9a-fA-F]{8,128}$' })
if ($keyFiles.Count -eq 0) { throw "No IndexNow key file found in $root. Expected <key>.txt at the site root." }
if ($keyFiles.Count -gt 1) {
  throw ("Found $($keyFiles.Count) IndexNow key files: " + ($keyFiles.Name -join ', ') +
         ". Only one may exist, and it must be the key registered with Bing. Delete the others.")
}
$keyFile = $keyFiles[0]

$key = (Get-Content $keyFile.FullName -Raw).Trim()
if ($key -ne $keyFile.BaseName) {
  throw "Key file mismatch: $($keyFile.Name) contains '$key'. IndexNow requires the filename and contents to be identical."
}

# Pull URLs from the sitemap so this never drifts from the real page list.
[xml]$sm = Get-Content (Join-Path $root 'sitemap.xml') -Raw
$entries = $sm.urlset.url | ForEach-Object {
  [PSCustomObject]@{ Url = $_.loc; LastMod = $_.lastmod }
}

if ($Recent -gt 0) {
  $entries = $entries | Sort-Object LastMod -Descending | Select-Object -First $Recent
}
$urls = @($entries | ForEach-Object { $_.Url })

if ($urls.Count -eq 0) { throw "No URLs found in sitemap.xml" }

$body = @{
  host        = $host_
  key         = $key
  keyLocation = "https://$host_/$($keyFile.Name)"
  urlList     = $urls
} | ConvertTo-Json -Depth 3

Write-Host "IndexNow: $($urls.Count) URLs"
Write-Host "  key file: https://$host_/$($keyFile.Name)"
if ($Recent -gt 0) { Write-Host "  most recent $Recent by lastmod" }

if ($WhatIf) {
  Write-Host "`n-WhatIf: nothing sent. URLs that would be submitted:"
  $urls | ForEach-Object { Write-Host "  $_" }
  return
}

# The key file must be reachable before submitting, or the whole batch is rejected.
try {
  $probe = Invoke-WebRequest -Uri "https://$host_/$($keyFile.Name)" -UseBasicParsing -TimeoutSec 20
  if ($probe.Content.Trim() -ne $key) {
    throw "Live key file does not match. Deploy first, then run this."
  }
  Write-Host "  key file is live and correct"
} catch {
  throw "Cannot read https://$host_/$($keyFile.Name) - deploy the key file before submitting. $_"
}

$resp = Invoke-WebRequest -Uri 'https://api.indexnow.org/indexnow' -Method Post `
  -ContentType 'application/json; charset=utf-8' `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
  -UseBasicParsing -TimeoutSec 60

# 200 accepted, 202 accepted but key still validating. Both are success.
switch ($resp.StatusCode) {
  200 { Write-Host "`nAccepted: $($urls.Count) URLs submitted." }
  202 { Write-Host "`nAccepted (202): submitted, key still validating. This is normal on a first run." }
  default { Write-Host "`nStatus $($resp.StatusCode): $($resp.StatusDescription)" }
}
