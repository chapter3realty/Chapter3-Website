# Submits every sitemap URL to IndexNow (Bing, Copilot, Yandex, Seznam pick this up).
# Run AFTER deploying, so the key file is live: .\indexnow-submit.ps1
$body = Get-Content -Raw "indexnow-payload.json"
Invoke-RestMethod -Uri "https://api.indexnow.org/indexnow" -Method Post -ContentType "application/json; charset=utf-8" -Body $body
Write-Host "Submitted $((($body | ConvertFrom-Json).urlList).Count) URLs to IndexNow."
