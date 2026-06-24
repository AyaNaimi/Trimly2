Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\ayana\Downloads\trimly-app\trimly - Copy\assets\images-portrait-original.png"
$destPath = "c:\Users\ayana\Downloads\trimly-app\trimly - Copy\assets\images-portrait-optimized300.png"

if (Test-Path $destPath) {
    Remove-Item $destPath
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

# Calculate new dimensions: target width 300, keep aspect ratio
$targetWidth = 300
$targetHeight = [int]($srcImg.Height * ($targetWidth / $srcImg.Width))

Write-Host "Resizing from $($srcImg.Width)x$($srcImg.Height) to $($targetWidth)x$($targetHeight)..."

# Create destination bitmap (explicitly 32bpp Argb to support transparency)
$destBmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($destBmp)

# Clear background with transparency
$g.Clear([System.Drawing.Color]::Transparent)

# Set rendering quality settings
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Draw the image
$rect = New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)
$g.DrawImage($srcImg, $rect)

# Save as PNG
$destBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Clean up
$g.Dispose()
$destBmp.Dispose()
$srcImg.Dispose()

$destSize = (Get-Item $destPath).Length
Write-Host "Optimized PNG (300px) size: $destSize bytes"
