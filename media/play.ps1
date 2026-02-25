param([string]$Path)
(New-Object Media.SoundPlayer $Path).PlaySync()
