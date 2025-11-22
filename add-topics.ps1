# PowerShell script to add topics to GitHub repository
# Requires GitHub Personal Access Token with repo scope

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$Owner = "LABOSO123",
    
    [Parameter(Mandatory=$false)]
    [string]$Repo = "Femora"
)

$topics = @(
    "women-health",
    "menstrual-cycle",
    "period-tracker",
    "fertility-tracker",
    "reproductive-health",
    "cycle-tracking",
    "javascript",
    "html5",
    "css3",
    "vanilla-javascript",
    "calendar",
    "symptom-tracker",
    "contraceptive-tracker",
    "menopause",
    "health-app",
    "web-app",
    "pwa",
    "kenya",
    "healthcare"
)

$headers = @{
    "Accept" = "application/vnd.github.mercy-preview+json"
    "Authorization" = "token $GitHubToken"
}

$body = @{
    names = $topics
} | ConvertTo-Json

$uri = "https://api.github.com/repos/$Owner/$Repo/topics"

try {
    $response = Invoke-RestMethod -Uri $uri -Method PUT -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ Successfully added topics to repository!" -ForegroundColor Green
    Write-Host "Topics added: $($response.names -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error adding topics: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "To use this script:" -ForegroundColor Yellow
    Write-Host "1. Create a GitHub Personal Access Token at: https://github.com/settings/tokens" -ForegroundColor Yellow
    Write-Host "2. Give it 'repo' scope" -ForegroundColor Yellow
    Write-Host "3. Run: .\add-topics.ps1 -GitHubToken 'your-token-here'" -ForegroundColor Yellow
}

