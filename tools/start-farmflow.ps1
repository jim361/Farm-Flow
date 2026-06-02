param(
    [switch]$SkipDockerDesktop
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$BackendDir = Join-Path $Root "backend"
$LogDir = Join-Path $Root "logs"
$CloudflaredConfig = Join-Path $Root "cloudflared-farmflow.yml"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Step {
    param([string]$Message)
    $line = "{0} {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
    $line | Tee-Object -FilePath (Join-Path $LogDir "farmflow-autostart.log") -Append
}

function Get-CommandPath {
    param(
        [string]$Name,
        [string[]]$Fallbacks = @()
    )

    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    foreach ($path in $Fallbacks) {
        if (Test-Path $path) {
            return $path
        }
    }

    throw "Cannot find executable: $Name"
}

function Test-Port {
    param(
        [string]$HostName,
        [int]$Port
    )

    try {
        $client = [System.Net.Sockets.TcpClient]::new()
        $iar = $client.BeginConnect($HostName, $Port, $null, $null)
        $connected = $iar.AsyncWaitHandle.WaitOne(500, $false)
        if ($connected) {
            $client.EndConnect($iar)
        }
        $client.Close()
        return $connected
    } catch {
        return $false
    }
}

function Wait-Port {
    param(
        [string]$HostName,
        [int]$Port,
        [int]$TimeoutSeconds = 90
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-Port -HostName $HostName -Port $Port) {
            return $true
        }
        Start-Sleep -Seconds 2
    }
    return $false
}

function Test-ProcessCommand {
    param([string]$Pattern)

    $escaped = [regex]::Escape($Pattern)
    return [bool](Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match $escaped })
}

function Test-DnsName {
    param(
        [string]$Name,
        [string]$Type = "A"
    )

    try {
        Resolve-DnsName -Name $Name -Type $Type -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Wait-CloudflareTunnelNetwork {
    param([int]$TimeoutSeconds = 180)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $tunnelDnsReady = Test-DnsName -Name "_v2-origintunneld._tcp.argotunnel.com" -Type "SRV"
        $apiDnsReady = Test-DnsName -Name "api.cloudflare.com" -Type "A"

        if ($tunnelDnsReady -and $apiDnsReady) {
            Write-Step "Cloudflare DNS is ready."
            return $true
        }

        Write-Step "Waiting for Cloudflare DNS/network readiness."
        Start-Sleep -Seconds 5
    }

    Write-Step "Warning: Cloudflare DNS/network did not become ready in time."
    return $false
}

function Start-CloudflaredTunnel {
    param(
        [string]$CloudflaredExe,
        [string]$CloudflaredConfig,
        [string]$Root,
        [string]$LogDir
    )

    Wait-CloudflareTunnelNetwork | Out-Null

    for ($attempt = 1; $attempt -le 3; $attempt++) {
        Write-Step "Starting Cloudflare tunnel. Attempt $attempt/3."
        Start-Process `
            -FilePath $CloudflaredExe `
            -ArgumentList "tunnel", "--config", $CloudflaredConfig, "run", "farmflow" `
            -WorkingDirectory $Root `
            -RedirectStandardOutput (Join-Path $LogDir "cloudflared.out.log") `
            -RedirectStandardError (Join-Path $LogDir "cloudflared.err.log") `
            -WindowStyle Hidden | Out-Null

        Start-Sleep -Seconds 12
        if (Test-ProcessCommand $CloudflaredConfig) {
            Write-Step "Cloudflare tunnel is running."
            return $true
        }

        Write-Step "Warning: Cloudflare tunnel stopped after start attempt $attempt."
        Start-Sleep -Seconds 8
    }

    Write-Step "Warning: Cloudflare tunnel could not be kept running."
    return $false
}

Write-Step "FarmFlow startup begin: $Root"

$DockerExe = Get-CommandPath "docker" @("C:\Program Files\Docker\Docker\resources\bin\docker.exe")
$NodeExe = Get-CommandPath "node" @("C:\Program Files\nodejs\node.exe")
$CloudflaredExe = Get-CommandPath "cloudflared" @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe"
)

if (-not $SkipDockerDesktop) {
    try {
        & $DockerExe info *> $null
    } catch {
        $DockerDesktop = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        if (Test-Path $DockerDesktop) {
            Write-Step "Docker is not ready. Starting Docker Desktop."
            Start-Process -FilePath $DockerDesktop | Out-Null
        } else {
            Write-Step "Docker is not ready, and Docker Desktop executable was not found."
        }
    }
}

$dockerReady = $false
for ($i = 0; $i -lt 60; $i++) {
    try {
        & $DockerExe info *> $null
        $dockerReady = $true
        break
    } catch {
        Start-Sleep -Seconds 3
    }
}

if (-not $dockerReady) {
    throw "Docker did not become ready within the startup timeout."
}

$FarmFlowContainers = @("farmflow-postgres", "farmflow-influxdb", "farmflow-redis", "farmflow-mqtt")
$ExistingContainers = @(& $DockerExe ps -a --format "{{.Names}}")
$MissingContainers = @($FarmFlowContainers | Where-Object { $ExistingContainers -notcontains $_ })

if ($MissingContainers.Count -eq 0) {
    Write-Step "Starting existing Docker containers."
    foreach ($container in $FarmFlowContainers) {
        & $DockerExe start $container | Tee-Object -FilePath (Join-Path $LogDir "docker-containers.log") -Append | Out-Null
    }
} else {
    Write-Step "Some containers are missing ($($MissingContainers -join ', ')). Running docker compose."
    & $DockerExe compose -f (Join-Path $Root "docker-compose.yml") up -d | Tee-Object -FilePath (Join-Path $LogDir "docker-compose.log") -Append
}

foreach ($port in @(5432, 6379, 1883, 9001)) {
    if (Wait-Port -HostName "127.0.0.1" -Port $port -TimeoutSeconds 90) {
        Write-Step "Port $port is ready."
    } else {
        Write-Step "Warning: port $port did not become ready in time."
    }
}

if (Test-Port -HostName "127.0.0.1" -Port 8080) {
    Write-Step "Backend already running on port 8080."
} else {
    Write-Step "Starting backend bootRun."
    Start-Process `
        -FilePath "C:\WINDOWS\system32\cmd.exe" `
        -ArgumentList "/c", "`"$BackendDir\gradlew.bat`" bootRun" `
        -WorkingDirectory $BackendDir `
        -RedirectStandardOutput (Join-Path $LogDir "backend-bootRun.out.log") `
        -RedirectStandardError (Join-Path $LogDir "backend-bootRun.err.log") `
        -WindowStyle Hidden | Out-Null

    if (Wait-Port -HostName "127.0.0.1" -Port 8080 -TimeoutSeconds 120) {
        Write-Step "Backend is ready on port 8080."
    } else {
        Write-Step "Warning: backend did not become ready in time."
    }
}

if (Test-Port -HostName "127.0.0.1" -Port 8787) {
    Write-Step "Public server already running on port 8787."
} else {
    Write-Step "Starting public Node server."
    Start-Process `
        -FilePath $NodeExe `
        -ArgumentList "tools\farmflow-cloudflare-server.js" `
        -WorkingDirectory $Root `
        -RedirectStandardOutput (Join-Path $LogDir "public-server.out.log") `
        -RedirectStandardError (Join-Path $LogDir "public-server.err.log") `
        -WindowStyle Hidden | Out-Null

    if (Wait-Port -HostName "127.0.0.1" -Port 8787 -TimeoutSeconds 60) {
        Write-Step "Public server is ready on port 8787."
    } else {
        Write-Step "Warning: public server did not become ready in time."
    }
}

if (Test-ProcessCommand $CloudflaredConfig) {
    Write-Step "Cloudflared tunnel already running."
} else {
    Start-CloudflaredTunnel `
        -CloudflaredExe $CloudflaredExe `
        -CloudflaredConfig $CloudflaredConfig `
        -Root $Root `
        -LogDir $LogDir | Out-Null
}

try {
    $health = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:8787/__health" -TimeoutSec 5
    Write-Step "Health check: $($health.StatusCode) $($health.Content)"
} catch {
    Write-Step "Warning: health check failed: $($_.Exception.Message)"
}

Write-Step "FarmFlow startup complete."
