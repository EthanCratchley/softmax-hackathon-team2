export function PassQRCode({ dataUrl, label, size = 184 }: { dataUrl: string | null; label: string; size?: number }) {
  if (!dataUrl) return <p className="qr-error" role="alert">QR code could not be created. Use the 8-digit number below.</p>;
  return <img className="pass-qr" src={dataUrl} width={size} height={size} alt={label} />;
}
