import QRCode from 'qrcode';

/**
 * Server-Side QR Code Generator
 * Generates local Data URLs or SVG strings without relying on external third-party services.
 */

/**
 * Generate a base64 Data URL for a given string
 * @param {string} text - Content to encode (e.g. booking verification code or UPI string)
 * @param {object} options
 * @returns {Promise<string>} Base64 PNG Data URL
 */
export async function generateQrDataUrl(text, options = {}) {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: options.width || 240,
      color: {
        dark: options.darkColor || '#11120D',
        light: options.lightColor || '#FFFFFF'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('[QR_SERVICE_ERROR] Failed to generate QR Data URL:', err.message);
    // Fallback safe 1x1 transparent PNG data url if generation fails
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23eee"/></svg>';
  }
}

/**
 * Generate an SVG string for a given text
 */
export async function generateQrSvg(text, options = {}) {
  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
      width: options.width || 240
    });
    return svgString;
  } catch (err) {
    console.error('[QR_SERVICE_ERROR] Failed to generate QR SVG:', err.message);
    return null;
  }
}

export default {
  generateQrDataUrl,
  generateQrSvg
};
