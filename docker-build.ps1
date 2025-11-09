# Script PowerShell pour builder l'image Docker avec optimisations

Write-Host "🔨 Building Docker image avec optimisations..." -ForegroundColor Cyan

# Builder avec plus de mémoire allouée à Docker
docker build `
  --memory="4g" `
  --memory-swap="4g" `
  --shm-size="2g" `
  -t invoice-app:latest `
  .;

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build terminé avec succès!" -ForegroundColor Green
    Write-Host "📦 Image: invoice-app:latest" -ForegroundColor Green
}
else {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}
