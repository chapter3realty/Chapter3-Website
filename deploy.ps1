# deploy.ps1 - the whole deploy, from PowerShell, in one file.
#
# Save it anywhere. Open PowerShell and run:
#   powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\deploy.ps1"
#
# It finds the clone, or makes one for you, pulls the branch, runs the gate,
# and deploys only if the gate passes.
#
# Two traps this handles, both of which have cost a deploy:
#   1. A downloaded copy of the site is not the clone. Deploying from one
#      uploads nothing and reports success (2026-09-07).
#   2. C:\Users\DevinDay is itself a git repo, for loanofficer.ai. Any git
#      command typed there answers for that project, not this one. This script
#      only ever runs git inside the verified clone.

param(
  [string]$Branch = "claude/github-account-check-wutg8b",
  [string]$ClonePath = "",
  [string]$NewClonePath = "C:\c3"
)

$ErrorActionPreference = "Continue"
$RepoUrl = "https://github.com/chapter3realty/Chapter3-Website.git"

function Say($msg)  { Write-Host $msg }
function Step($msg) { Write-Host "" ; Write-Host "=== $msg" -ForegroundColor Cyan }
function Good($msg) { Write-Host $msg -ForegroundColor Green }
function Fail($msg) { Write-Host "" ; Write-Host "STOPPED: $msg" -ForegroundColor Red ; Write-Host "" ; Read-Host "Press Enter to close" ; exit 1 }

# A folder is the clone only if it has both of these.
function Test-Clone($p) {
  if (-not $p) { return $false }
  if (-not (Test-Path -LiteralPath $p)) { return $false }
  return ((Test-Path -LiteralPath (Join-Path $p "build.js")) -and (Test-Path -LiteralPath (Join-Path $p ".git")))
}

# Accept a pasted path even when it arrives as a whole command with quotes.
function Clean-Path($t) {
  if (-not $t) { return "" }
  $t = $t.Trim()
  $t = $t -replace '(?i)^\s*(cd|set-location|chdir)\s+', ''
  $t = $t.Trim()
  $t = $t.Trim('"')
  $t = $t.Trim("'")
  $t = $t -replace '(?i)\$env:USERPROFILE', $env:USERPROFILE
  $t = [System.Environment]::ExpandEnvironmentVariables($t)
  return $t.Trim()
}

# ---------------------------------------------------------------- find the clone
Step "Looking for the Chapter3-Website clone"

$clone = $null

$candidates = @()
if ($ClonePath) { $candidates += (Clean-Path $ClonePath) }
$candidates += @(
  "C:\c3",
  "$env:USERPROFILE\Chapter3-Website",
  "$env:USERPROFILE\Desktop\Chapter3-Website",
  "$env:USERPROFILE\Documents\Chapter3-Website",
  "$env:USERPROFILE\source\repos\Chapter3-Website",
  "$env:USERPROFILE\c3deploy"
)
foreach ($c in $candidates) {
  if (Test-Clone $c) { $clone = (Resolve-Path -LiteralPath $c).Path ; break }
}

# Not in the usual places. Search a couple of roots, shallow, quietly.
if (-not $clone) {
  Say "Not in the usual places. Searching your drive. This takes a moment."
  $roots = @("C:\", "$env:USERPROFILE")
  if (Test-Path "D:\") { $roots += "D:\" }
  foreach ($root in $roots) {
    $hits = Get-ChildItem -LiteralPath $root -Filter "build.js" -Recurse -Depth 3 -File -ErrorAction SilentlyContinue
    foreach ($h in $hits) {
      if (Test-Clone $h.DirectoryName) { $clone = $h.DirectoryName ; break }
    }
    if ($clone) { break }
  }
}

# ---------------------------------------------------------------- or make one
if (-not $clone) {
  Step "You do not have a clone on this computer"
  Say "A clone is the live copy of the site, connected to GitHub. You need one to deploy."
  Say "I can download it now to: $NewClonePath"
  Say "It is about 200 MB and takes a few minutes. A GitHub sign-in window may appear."
  Say ""
  $mk = Read-Host "Download it now? (y/n)"
  if ($mk -ne "y") { Fail "Nothing was changed. Run this again when you are ready to download the clone." }

  if (Test-Path -LiteralPath $NewClonePath) {
    Fail "$NewClonePath already exists but is not a clone. Delete or rename that folder, then run this again."
  }

  Step "Downloading the clone"
  & git clone --branch $Branch $RepoUrl $NewClonePath
  if ($LASTEXITCODE -ne 0) { Fail "The download failed. Send me the message above." }

  if (-not (Test-Clone $NewClonePath)) { Fail "The download finished but $NewClonePath has no build.js. Send me what you see." }
  $clone = (Resolve-Path -LiteralPath $NewClonePath).Path
  Good "Clone downloaded to $clone"
  Say "From now on this script finds it automatically."
}

Set-Location -LiteralPath $clone
Say "Clone: $clone"

# ---------------------------------------------------------------- verify the repo
# Every git command below runs here, never in your home folder.
$remote = (& git remote get-url origin 2>$null)
if ($LASTEXITCODE -ne 0) { Fail "git could not read this folder. Send me the message above." }
if ($remote -notmatch "Chapter3-Website") {
  Fail "This folder points at the wrong project. Its remote reads: $remote"
}
Say "Remote: $remote"

# Windows rewrites line endings by default, which changes every asset hash and
# makes the gate report every file as edited. Turn it off once, in this clone.
$autocrlf = (& git config core.autocrlf 2>$null)
if ($autocrlf -ne "false") {
  & git config core.autocrlf false
  Say "Turned off Windows line-ending rewriting in this clone."
}

# ---------------------------------------------------------------- uncommitted work
$dirty = (& git status --porcelain)
if ($dirty) {
  Step "This clone has changes that were never committed"
  Say $dirty
  Say ""
  Say "The next step throws those away and takes the branch exactly as it is on GitHub."
  $ok = Read-Host "Throw them away and continue? (y/n)"
  if ($ok -ne "y") { Fail "Nothing was changed. Your local edits are still in $clone." }
}

# ---------------------------------------------------------------- pull the branch
Step "Pulling $Branch"

$fetched = $false
$delay = 2
for ($i = 1; $i -le 5; $i++) {
  & git fetch origin $Branch
  if ($LASTEXITCODE -eq 0) { $fetched = $true ; break }
  Say "Could not reach GitHub. Trying again in $delay seconds."
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

if (-not (Test-Path -LiteralPath (Join-Path $clone "chapter3realty"))) {
  Fail "The site folder 'chapter3realty' is missing from the clone. Send me what you see."
}

# ---------------------------------------------------------------- the gate
Step "Running the gate (node build.js preflight)"

& node --version | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "Node is not installed, or not on the PATH. Install Node, then run this again." }

& node build.js preflight
if ($LASTEXITCODE -ne 0) { Fail "The gate found problems. Nothing was deployed. Send me the output above." }

Say ""
Good "Gate passed."

# ---------------------------------------------------------------- deploy
Step "Deploying to production"
Say "This uploads the chapter3realty folder to Cloudflare Pages on the production branch."
$go = Read-Host "Deploy now? (y/n)"
if ($go -ne "y") { Fail "Nothing was deployed. The clone is up to date, so you can run this again any time." }

& npx wrangler pages deploy chapter3realty --project-name chapter3realty --branch production --commit-dirty=true
if ($LASTEXITCODE -ne 0) { Fail "Wrangler failed. Nothing shipped. Send me the output above." }

# ---------------------------------------------------------------- check it is live
Step "Checking the live site"
Start-Sleep -Seconds 10

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
Good "Done. A page that reads FAILED right now is usually the domain catching up. Check it again in a minute."
Say ""
Read-Host "Press Enter to close"
