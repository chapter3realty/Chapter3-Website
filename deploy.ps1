# deploy.ps1 - the whole deploy, from PowerShell, in one file.
#
# Save it anywhere. Right-click it and pick "Run with PowerShell", or open
# PowerShell and run:  powershell -ExecutionPolicy Bypass -File .\deploy.ps1
#
# It finds your clone, pulls the branch, runs the gate, and only deploys if the
# gate passes. It never deploys from a downloaded folder. That mistake shipped
# nothing on 2026-09-07 and reported success.

param(
  [string]$Branch = "claude/github-account-check-wutg8b",
  [string]$ClonePath = ""
)

$ErrorActionPreference = "Continue"

function Say($msg)  { Write-Host $msg }
function Step($msg) { Write-Host "" ; Write-Host "=== $msg" -ForegroundColor Cyan }
function Fail($msg) { Write-Host "" ; Write-Host "STOPPED: $msg" -ForegroundColor Red ; Read-Host "Press Enter to close" ; exit 1 }

# ---------------------------------------------------------------- find the clone
Step "Finding your clone"

$candidates = @()
if ($ClonePath) { $candidates += $ClonePath }
$candidates += @(
  "$env:USERPROFILE\Chapter3-Website",
  "$env:USERPROFILE\Desktop\Chapter3-Website",
  "$env:USERPROFILE\Documents\Chapter3-Website",
  "$env:USERPROFILE\source\repos\Chapter3-Website",
  "$env:USERPROFILE\c3deploy",
  "$env:USERPROFILE\Desktop\c3deploy",
  (Get-Location).Path
)

$clone = $null
foreach ($c in $candidates) {
  if (-not $c) { continue }
  if ((Test-Path (Join-Path $c "build.js")) -and (Test-Path (Join-Path $c ".git"))) { $clone = (Resolve-Path $c).Path ; break }
}

if (-not $clone) {
  Say "I could not find the clone in the usual places."
  Say "Open the folder that has build.js in it, copy the path from the address bar, and paste it here."
  $typed = Read-Host "Clone path"
  if ($typed -and (Test-Path (Join-Path $typed "build.js")) -and (Test-Path (Join-Path $typed ".git"))) {
    $clone = (Resolve-Path $typed).Path
  } else {
    Fail "That folder has no build.js and no .git, so it is not the clone. A downloaded copy will not work."
  }
}

Set-Location $clone
Say "Clone: $clone"

# check it is the right repository
$remote = (& git remote get-url origin) 2>$null
if ($LASTEXITCODE -ne 0 -or $remote -notmatch "Chapter3-Website") {
  Fail "This folder's git remote is not Chapter3-Website. Remote reads: $remote"
}
Say "Remote: $remote"

# ---------------------------------------------------------------- windows line endings
# Git's Windows default rewrites line endings, which changes every asset's hash
# and makes preflight report every CSS and JS file as edited. Turn it off once.
$autocrlf = (& git config core.autocrlf) 2>$null
if ($autocrlf -ne "false") {
  Step "Turning off Windows line-ending rewriting (one time)"
  & git config core.autocrlf false
  Say "Set core.autocrlf to false."
}

# ---------------------------------------------------------------- uncommitted work
$dirty = (& git status --porcelain)
if ($dirty) {
  Step "This clone has changes that are not committed"
  Say $dirty
  Say ""
  Say "The next step throws these away and takes the branch exactly as it is on GitHub."
  $ok = Read-Host "Throw them away and continue? (y/n)"
  if ($ok -ne "y") { Fail "Nothing was changed. Your local edits are still here." }
}

# ---------------------------------------------------------------- pull the branch
Step "Pulling $Branch"

$fetched = $false
$delay = 2
for ($i = 1; $i -le 5; $i++) {
  & git fetch origin $Branch
  if ($LASTEXITCODE -eq 0) { $fetched = $true ; break }
  Say "Fetch failed. Trying again in $delay seconds."
  Start-Sleep -Seconds $delay
  $delay = $delay * 2
}
if (-not $fetched) { Fail "Could not reach GitHub after five tries. Check the internet, then run this again." }

& git reset --hard FETCH_HEAD
if ($LASTEXITCODE -ne 0) { Fail "git reset failed. Nothing was deployed." }

$head = (& git rev-parse --short HEAD)
$subject = (& git log -1 --pretty=%s)
Say ""
Say "Now on commit $head"
Say "  $subject"

# ---------------------------------------------------------------- the gate
Step "Running the gate (node build.js preflight)"

& node --version | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "Node is not installed, or not on the PATH. Install Node, then run this again." }

& node build.js preflight
if ($LASTEXITCODE -ne 0) { Fail "The gate found problems. Nothing was deployed. Send me the output above." }

Say ""
Write-Host "Gate passed." -ForegroundColor Green

# ---------------------------------------------------------------- deploy
Step "Deploying to production"
Say "This uploads the chapter3realty folder to Cloudflare Pages on the production branch."
$go = Read-Host "Deploy now? (y/n)"
if ($go -ne "y") { Fail "Nothing was deployed. The clone is up to date, so you can run this again any time." }

& npx wrangler pages deploy chapter3realty --project-name chapter3realty --branch production
if ($LASTEXITCODE -ne 0) { Fail "Wrangler failed. Nothing shipped. Send me the output above." }

# ---------------------------------------------------------------- check it is live
Step "Checking the live site"
Start-Sleep -Seconds 8

$urls = @(
  "https://chapter3realty.com/invest/section-8-rentals/",
  "https://chapter3realty.com/invest/new-construction-rentals/",
  "https://chapter3realty.com/invest/financing-multiple-rentals/",
  "https://chapter3realty.com/invest/landlord-insurance/",
  "https://chapter3realty.com/invest/rent-prices/"
)
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -Method Head -UseBasicParsing -TimeoutSec 20
    Say ("{0}  {1}" -f $r.StatusCode, $u)
  } catch {
    Say ("FAILED  {0}" -f $u)
  }
}

Say ""
Write-Host "Done. A page that reads 404 right now is usually the domain catching up. Check it again in a minute." -ForegroundColor Green
Read-Host "Press Enter to close"
