package com.keithinretrograde.affirmations

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.media.Image
import androidx.palette.graphics.Palette
import com.mrousavy.camera.frameprocessor.Frame
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessor.SharedArray
import com.mrousavy.camera.types.PixelFormat
import java.io.ByteArrayOutputStream

class ColorLensFrameProcessorPlugin(proxy: com.mrousavy.camera.core.CameraXProxy, options: Map<String, Any>?) : FrameProcessorPlugin() {

    // Shared Paint objects for drawing, if needed, can be defined here
    // private val paint = Paint()

    // Frame rate limiting
    private var lastProcessTime: Long = 0
    private val minProcessingInterval: Long = 100 // Corresponds to 10 FPS max (1000ms / 10)

    // Maximum image size for processing (performance optimization)
    private val maxImageSize: Float = 256.0f

    // Pre-allocated result map to reuse
    private var resultMap: MutableMap<String, String> = mutableMapOf()

    init {
        // Pre-allocate result map for 8 colors
        resultMap.ensureCapacity(8)
    }

    private fun imageToBitmap(image: Image): Bitmap? {
        if (image.format != PixelFormat.YUV_420_888.toImageFormat() && image.format != PixelFormat.PRIVATE.toImageFormat()) {
            // Convert to NV21 if not already. This is a common format for YUV_420_888 on Android.
            // VisionCamera might provide images in other formats too.
            // For simplicity, we only handle YUV_420_888 directly or attempt a conversion.
            // More robust handling might be needed for other formats.
            println("ColorLensFrameProcessor: Image format not directly supported for Bitmap conversion: ${image.format}. Add conversion logic if needed.")
            return null
        }
        
        val planes = image.planes
        val yBuffer = planes[0].buffer
        val uBuffer = planes[1].buffer
        val vBuffer = planes[2].buffer

        val ySize = yBuffer.remaining()
        val uSize = uBuffer.remaining()
        val vSize = vBuffer.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)

        yBuffer.get(nv21, 0, ySize)
        // For NV21, V and U planes are interleaved. However, Image planes are separate.
        // We need to interleave them correctly or use a library that handles this.
        // The YuvImage class can convert YUV to JPEG, then to Bitmap, which is simpler but less efficient.

        // A common approach for converting YUV_420_888 to Bitmap:
        // Use a YuvImage and then decode with BitmapFactory
        // This is not the most performant but is relatively straightforward.

        // Let's try a more direct approach using RenderScript or a similar efficient library if available
        // For now, as a placeholder, we'll use a method that might be slower but works for YUV.
        // This part needs careful implementation for performance.
        // A simple path is converting YUV to JPEG then to Bitmap:
        try {
            val yuvImage = android.graphics.YuvImage(nv21, android.graphics.ImageFormat.NV21, image.width, image.height, null)
            val out = ByteArrayOutputStream()
            yuvImage.compressToJpeg(android.graphics.Rect(0, 0, image.width, image.height), 100, out)
            val imageBytes = out.toByteArray()
            return android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
        } catch (e: Exception) {
            println("Error converting YUV Image to Bitmap: ${e.message}")
            return null
        }
    }


    private fun downsampleBitmap(bitmap: Bitmap): Bitmap {
        val width = bitmap.width
        val height = bitmap.height

        if (width <= maxImageSize && height <= maxImageSize) {
            return bitmap
        }

        val scale = Math.min(maxImageSize / width, maxImageSize / height)
        val matrix = Matrix()
        matrix.postScale(scale, scale)
        return Bitmap.createBitmap(bitmap, 0, 0, width, height, matrix, true)
    }

    private fun colorToHex(color: Int): String {
        return String.format("#%02X%02X%02X", Color.red(color), Color.green(color), Color.blue(color))
    }

    private fun extractColorsFromBitmap(bitmap: Bitmap): Map<String, String>? {
        return try {
            val palette = Palette.from(bitmap).maximumColorCount(16).generate() // Analyze with more colors for better selection

            val dominantSwatch = palette.dominantSwatch
            val vibrantSwatch = palette.vibrantSwatch
            val darkVibrantSwatch = palette.darkVibrantSwatch
            val lightVibrantSwatch = palette.lightVibrantSwatch
            val mutedSwatch = palette.mutedSwatch
            // val darkMutedSwatch = palette.darkMutedSwatch
            // val lightMutedSwatch = palette.lightMutedSwatch

            val sortedSwatches = palette.swatches.sortedByDescending { it.population }

            val topColors = sortedSwatches.take(6).map { colorToHex(it.rgb) }
            val defaultColor = dominantSwatch?.let { colorToHex(it.rgb) } ?: "#000000"

            val colors = (topColors + List(6 - topColors.size) { defaultColor }).take(6)

            val background = dominantSwatch?.let { colorToHex(it.rgb) } ?: defaultColor
            val detail = sortedSwatches.getOrNull(1)?.let { colorToHex(it.rgb) } ?: background


            resultMap.clear()
            resultMap["primary"] = colors.getOrElse(0) { defaultColor }
            resultMap["secondary"] = colors.getOrElse(1) { defaultColor }
            resultMap["tertiary"] = colors.getOrElse(2) { defaultColor }
            resultMap["quaternary"] = colors.getOrElse(3) { defaultColor }
            resultMap["quinary"] = colors.getOrElse(4) { defaultColor }
            resultMap["senary"] = colors.getOrElse(5) { defaultColor }
            resultMap["background"] = background
            resultMap["detail"] = detail
            resultMap
        } catch (e: Exception) {
            println("Error extracting colors: ${e.message}")
            null
        }
    }


    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastProcessTime < minProcessingInterval) {
            return null // Skip frame
        }
        lastProcessTime = currentTime

        if (frame.pixelFormat != PixelFormat.YUV_420_888 && frame.pixelFormat != PixelFormat.PRIVATE) {
             println("ColorLensFrameProcessor: Unexpected pixel format: ${frame.pixelFormat}. Expected YUV_420_888 or PRIVATE.")
             return null
        }

        try {
            // Convert to Bitmap
            // Note: frame.image is an androidx.camera.core.ImageProxy, which wraps android.media.Image
            val image = frame.image
            var bitmap = imageToBitmap(image) ?: return null

            // Downsample
            bitmap = downsampleBitmap(bitmap)

            // Extract colors
            return extractColorsFromBitmap(bitmap)

        } catch (e: Exception) {
            println("ColorLensFrameProcessor Error: ${e.message}")
            return null
        }
    }
}
