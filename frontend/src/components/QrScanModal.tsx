import { useEffect, useRef } from 'react';
import { Modal, Typography } from 'antd';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  open: boolean;
  title: string;
  hint: string;
  cancelText: string;
  onScan: (value: string) => void;
  onCancel: () => void;
}

const SCANNER_ID = 'qr-scanner-region';

export default function QrScanModal({ open, title, hint, cancelText, onScan, onCancel }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    if (!open) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;
        scanningRef.current = true;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (scanningRef.current) {
              scanningRef.current = false;
              stopScanner().then(() => onScan(decodedText));
            }
          },
          () => { /* ignore per-frame errors */ },
        );
      } catch {
        // Camera permission denied or unavailable — close modal
        onCancel();
      }
    };

    // Delay slightly so the DOM element is mounted
    const timer = setTimeout(startScanner, 200);
    return () => clearTimeout(timer);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopScanner = async () => {
    const s = scannerRef.current;
    if (s) {
      try {
        if (s.isScanning) await s.stop();
        s.clear();
      } catch {
        // ignore cleanup errors
      }
      scannerRef.current = null;
    }
  };

  const handleCancel = () => {
    scanningRef.current = false;
    stopScanner().then(onCancel);
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      width={320}
    >
      <div id={SCANNER_ID} style={{ width: '100%' }} />
      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, textAlign: 'center' }}>
        {hint}
      </Typography.Text>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Typography.Link onClick={handleCancel}>{cancelText}</Typography.Link>
      </div>
    </Modal>
  );
}
