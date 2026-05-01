Add-Type -AssemblyName System.Drawing
$size = 512
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# 1. Background Circle with Slightly Lighter Dark Blue
$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$linGrBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 3, 74, 129), # Slightly lighter than #023965
    [System.Drawing.Color]::FromArgb(255, 2, 57, 101),  # #023965
    45.0
)
$g.FillEllipse($linGrBrush, 10, 10, $size - 20, $size - 20)

# 2. Subtle Shine
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(10, 10, $size - 20, $size - 20)
$pbg = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
$pbg.CenterColor = [System.Drawing.Color]::FromArgb(60, 255, 255, 255)
$pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillEllipse($pbg, 10, 10, $size - 20, $size - 20)

# 3. Monogram 'Fz' (Capital F, Lowercase z)
$font = New-Object System.Drawing.Font("Segoe UI Semibold", 180, [System.Drawing.FontStyle]::Bold)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

# Shadow
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 0, 0, 0))
$g.DrawString("Fz", $font, $shadowBrush, (New-Object System.Drawing.RectangleF(0, 8, $size, $size)), $format)

# Main Text
$g.DrawString("Fz", $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(0, 0, $size, $size)), $format)

# 4. Save and Generate Sizes
$masterPath = "d:\Proyectos\finan-react\public\icon\icon-512x512.png"
$bmp.Save($masterPath, [System.Drawing.Imaging.ImageFormat]::Png)

function Resize-Icon($s, $n) {
    $dest = "d:\Proyectos\finan-react\public\icon\$n.png"
    $newImg = New-Object System.Drawing.Bitmap($s, $s)
    $gr = [System.Drawing.Graphics]::FromImage($newImg)
    $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gr.DrawImage($bmp, 0, 0, $s, $s)
    $newImg.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $gr.Dispose()
    $newImg.Dispose()
}

Resize-Icon 192 "icon-192x192"
Resize-Icon 180 "apple-touch-icon"
Resize-Icon 48 "favicon"
Resize-Icon 152 "og-image"

# Cleanup
$g.Dispose()
$bmp.Dispose()
$linGrBrush.Dispose()
$pbg.Dispose()
$font.Dispose()
$format.Dispose()
$shadowBrush.Dispose()
