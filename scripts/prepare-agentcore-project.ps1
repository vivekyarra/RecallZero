# Generate ignored AgentCore/CDK scaffolding around the tracked RecallZero agent.
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$outputDir = Join-Path $repo '.agentcore'
$projectDir = Join-Path $outputDir 'RecallZeroProof'

if (-not (Test-Path -LiteralPath $projectDir)) {
    & agentcore create `
        --project-name RecallZeroProof `
        --name RecallZeroRemedy `
        --language Python `
        --framework Strands `
        --model-provider Bedrock `
        --memory none `
        --build CodeZip `
        --idle-timeout 60 `
        --max-lifetime 300 `
        --output-dir $outputDir `
        --skip-git `
        --skip-install `
        --skip-python-setup
    if ($LASTEXITCODE -ne 0) { throw 'AgentCore scaffolding failed.' }
}

$configPath = Join-Path $projectDir 'agentcore/agentcore.json'
$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
if ($config.runtimes.Count -ne 1 -or $config.runtimes[0].name -ne 'RecallZeroRemedy') {
    throw 'Unexpected AgentCore scaffold; refusing to change it.'
}
$config.runtimes[0].codeLocation = '../../services/agent/'
$config.runtimes[0].runtimeVersion = 'PYTHON_3_13'
$source = (Resolve-Path -LiteralPath (Join-Path $projectDir $config.runtimes[0].codeLocation)).Path
$expected = (Resolve-Path -LiteralPath (Join-Path $repo 'services/agent')).Path
if ($source.TrimEnd([char]'\') -ne $expected.TrimEnd([char]'\')) {
    throw 'Scaffold does not resolve to the tracked RecallZero agent.'
}
$json = $config | ConvertTo-Json -Depth 30
[System.IO.File]::WriteAllText($configPath, $json + "`n", [System.Text.UTF8Encoding]::new($false))

& npm.cmd install --prefix (Join-Path $projectDir 'agentcore/cdk')
if ($LASTEXITCODE -ne 0) { throw 'CDK dependency install failed.' }
Write-Output "Prepared $projectDir from $source"
