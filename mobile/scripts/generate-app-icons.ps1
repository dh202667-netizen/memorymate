$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'src\static\app-icons'
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null
# Rasterize the project-owned vector geometry from app-icon.svg without external services.
foreach ($size in @(48, 72, 96, 144, 192, 512, 1024)) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#FFF0C9'))
  $graphics.ScaleTransform(($size / 1024.0), ($size / 1024.0))
  $pale = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#FFF9EF'))
  $graphics.FillEllipse($pale, 184, 160, 656, 656)
  $stem = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#315B48'), 36)
  $stem.StartCap = $stem.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawLine($stem, 512, 704, 512, 434)
  $leaves = @(
    @{ Color='#96AA7F'; Curve=@(512,524,332,524,302,394,322,294,452,284,542,364,512,524) },
    @{ Color='#315B48'; Curve=@(512,434,502,274,612,194,722,214,742,364,632,454,512,434) },
    @{ Color='#B9C8A7'; Curve=@(512,644,402,644,332,584,352,504,452,494,522,554,512,644) }
  )
  foreach ($leaf in $leaves) {
    $curve = $leaf.Curve
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddBezier($curve[0],$curve[1],$curve[2],$curve[3],$curve[4],$curve[5],$curve[6],$curve[7])
    $path.AddBezier($curve[6],$curve[7],$curve[8],$curve[9],$curve[10],$curve[11],$curve[12],$curve[13])
    $path.CloseFigure()
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($leaf.Color))
    $graphics.FillPath($brush, $path)
    $path.Dispose(); $brush.Dispose()
  }
  $accent = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#8A481E'),28)
  $accent.StartCap = $accent.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawLine($accent,344,805,680,805)
  $bitmap.Save((Join-Path $iconDirectory "icon-$size.png"),[System.Drawing.Imaging.ImageFormat]::Png)
  $accent.Dispose(); $pale.Dispose(); $stem.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
  Write-Output "Generated icon-$size.png"
}
$nativeIcons = Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'resources\android'
New-Item -ItemType Directory -Path $nativeIcons -Force | Out-Null
Copy-Item -Path (Join-Path $iconDirectory 'icon-*.png') -Destination $nativeIcons -Force
