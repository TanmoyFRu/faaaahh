param([string]$Path, [int]$Volume = 100)

if ($Volume -ge 100) {
  (New-Object Media.SoundPlayer $Path).PlaySync()
  exit
}

try {
  $wmp = New-Object -ComObject WMPlayer.OCX
  $wmp.settings.volume = [Math]::Max(0, [Math]::Min(100, $Volume))
  $wmp.URL = $Path
  $wmp.controls.play()
  do { Start-Sleep -Milliseconds 50 } while ($wmp.playState -eq 3)
  $wmp.close()
} catch {
  (New-Object Media.SoundPlayer $Path).PlaySync()
}
