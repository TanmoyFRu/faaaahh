try {
  Add-Type -AssemblyName PresentationCore
  $player = New-Object System.Windows.Media.MediaPlayer
  $uri = New-Object System.Uri("d:\Faaaaaahhh\media\ahhhh.wav", [System.UriKind]::Absolute)
  $player.Open($uri)
  $player.Volume = 0.5
  $player.Play()

  $ticks = 0
  while (-not $player.NaturalDuration.HasTimeSpan -and $ticks -lt 50) {
      Start-Sleep -Milliseconds 10
      $ticks++
  }

  if ($player.NaturalDuration.HasTimeSpan) {
      $duration = $player.NaturalDuration.TimeSpan.TotalMilliseconds
      Write-Host "Duration ($duration) ms"
      Start-Sleep -Milliseconds ($duration + 50)
  } else {
      Write-Host "No timespan"
      Start-Sleep -Seconds 2
  }
  
  $player.Close()
} catch {
  Write-Host "Error"
}
