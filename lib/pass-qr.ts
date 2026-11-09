import 'server-only';
import QRCode from 'qrcode';

export async function createPassQrData(token: string, width: number): Promise<string | null> {
  try {
    return await QRCode.toDataURL(token, { width, margin: 2, errorCorrectionLevel: 'Q' });
  } catch {
    return null;
  }
}
