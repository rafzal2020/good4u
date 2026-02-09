# Install git hooks so Cursor is never added as co-author.
$hookSrc = Join-Path $PSScriptRoot "git-hooks\prepare-commit-msg"
$hookDest = Join-Path (git rev-parse --git-dir) "hooks\prepare-commit-msg"
Copy-Item -Path $hookSrc -Destination $hookDest -Force
Write-Host "Installed prepare-commit-msg hook. Cursor will not be added as co-author."
if ($IsWindows -or $env:OS -match "Windows") {
  # Hook is .sh; Git for Windows will run it with sh
  Write-Host "Done. The hook will strip 'Co-authored-by: Cursor' from all future commits."
}
