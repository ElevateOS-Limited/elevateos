param(
    [string]$AppId = '7f7b18d4-e50c-4b84-a472-8139cbe320a9',
    [string]$Branch = 'main',
    [string]$LiveUrl = 'https://elevateos.org',
    [switch]$SkipBuild,
    [switch]$SkipPush,
    [switch]$SkipDeploy,
    [switch]$SkipVerify
)

$ErrorActionPreference = 'Stop'

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][scriptblock]$ScriptBlock
    )

    Write-Host "==> $Label"
    & $ScriptBlock
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE"
    }
}

function Assert-CleanTrackedTree {
    $dirty = git status --porcelain --untracked-files=no
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to inspect git status before publishing.'
    }

    if (-not [string]::IsNullOrWhiteSpace($dirty)) {
        throw "Working tree has tracked changes. Commit or stash them before publishing:`n$dirty"
    }
}

$currentBranch = (git branch --show-current).Trim()
if ($currentBranch -ne $Branch) {
    throw "Expected to publish from branch '$Branch', but current branch is '$currentBranch'."
}

Assert-CleanTrackedTree

if (-not $SkipBuild) {
    Invoke-Checked -Label 'npm run lint' -ScriptBlock { npm run lint }
    Invoke-Checked -Label 'npm run build' -ScriptBlock { npm run build }
}

$headCommit = (git rev-parse HEAD).Trim()

if (-not $SkipPush) {
    Invoke-Checked -Label "git push origin $Branch" -ScriptBlock { git push origin $Branch }
}

if (-not $SkipDeploy) {
    $deploymentLine = doctl apps create-deployment $AppId --force-rebuild --wait --format ID,Phase --no-header | Select-Object -First 1
    if ($LASTEXITCODE -ne 0) {
        throw "doctl apps create-deployment $AppId --force-rebuild --wait failed."
    }

    $deploymentId = (($deploymentLine -split '\s+') | Select-Object -First 1).Trim()
    if ([string]::IsNullOrWhiteSpace($deploymentId)) {
        throw 'DigitalOcean did not return a deployment id.'
    }

    $phase = (($deploymentLine -split '\s+') | Select-Object -Skip 1 -First 1).Trim()
    if ([string]::IsNullOrWhiteSpace($phase)) {
        $phase = (doctl apps get-deployment $AppId $deploymentId --format Phase --no-header | Select-Object -First 1).Trim()
        if ($LASTEXITCODE -ne 0) {
            throw "doctl apps get-deployment $AppId $deploymentId failed after create-deployment --wait."
        }
    }

    if ($phase -ne 'ACTIVE') {
        throw "DigitalOcean deployment $deploymentId finished in phase '$phase'."
    }
}

if (-not $SkipVerify) {
    $response = Invoke-WebRequest -Uri $LiveUrl -UseBasicParsing -TimeoutSec 20
    if ($response.StatusCode -ne 200) {
        throw "Live verification failed for $LiveUrl with status code $($response.StatusCode)."
    }
}

Write-Host "Published $headCommit to $AppId and verified $LiveUrl."
