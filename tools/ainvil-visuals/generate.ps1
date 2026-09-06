$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundledNode = 'C:\Users\wiseongjun\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$bundledModules = 'C:\Users\wiseongjun\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'

if (Test-Path -LiteralPath $bundledNode) {
    $env:NODE_PATH = $bundledModules
    & $bundledNode (Join-Path $scriptDir 'generate.mjs')
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $bundledNode (Join-Path $scriptDir 'verify-evidence.mjs')
    exit $LASTEXITCODE
}

node (Join-Path $scriptDir 'generate.mjs')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node (Join-Path $scriptDir 'verify-evidence.mjs')
exit $LASTEXITCODE
