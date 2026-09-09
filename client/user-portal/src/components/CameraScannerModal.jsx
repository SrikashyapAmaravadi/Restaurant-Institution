import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  FlipHorizontal,
  Zap,
  ZapOff,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  Utensils,
  User,
  Clock,
  Calendar,
  Armchair
} from 'lucide-react';

/**
 * CameraScannerModal
 * High-performance WebRTC camera scanner for student digital passes and reservation QR codes.
 * Supports live camera stream, torch control, camera flipping, QR detection, and test pass simulation.
 */
export default function CameraScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  reservations = []
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState(null);

  // Play audio confirmation tone using Web Audio API
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // Start Camera Stream
  const startCamera = async (mode = facingMode) => {
    setCameraLoading(true);
    setCameraError('');

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera API is not supported in this browser environment. Use manual pass simulation below.');
      setCameraLoading(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check if torch / flash is supported
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      setTorchSupported(Boolean(capabilities.torch));

      setHasCamera(true);
      setCameraLoading(false);
    } catch (err) {
      console.warn('Camera access issue:', err);
      setHasCamera(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on this device.');
      } else {
        setCameraError(`Camera connection note: ${err.message || 'Unable to open camera stream'}`);
      }
      setCameraLoading(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const nextTorch = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('Could not toggle torch:', err);
    }
  };

  // Toggle Facing Mode (Front / Back)
  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Handle successful scan match
  const handleMatchedPass = (passCode) => {
    const cleanCode = passCode.trim();
    if (!cleanCode) return;

    playBeep();
    if (navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // ignore
      }
    }

    const matched = reservations.find(r =>
      r.id.toLowerCase() === cleanCode.toLowerCase() ||
      cleanCode.toLowerCase().includes(r.id.toLowerCase())
    );

    const result = {
      code: cleanCode,
      reservation: matched || null,
      timestamp: new Date().toLocaleTimeString()
    };

    setScannedResult(result);
  };

  // Initialize and tear down camera on open/close
  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Continuously scan video stream if BarcodeDetector API is present in browser
  useEffect(() => {
    let animId;
    let detector = null;

    if (isOpen && 'BarcodeDetector' in window) {
      try {
        detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39'] });
      } catch {
        detector = null;
      }
    }

    const scanFrame = async () => {
      if (detector && videoRef.current && videoRef.current.readyState >= 2 && !scannedResult) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            if (raw) {
              handleMatchedPass(raw);
              return;
            }
          }
        } catch {
          // ignore scan frame exceptions
        }
      }
      if (isOpen && !scannedResult) {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    if (isOpen && detector) {
      animId = requestAnimationFrame(scanFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, scannedResult]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 1050,
        backgroundColor: 'rgba(7, 18, 12, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card anim-scale-in"
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#0B2417',
          border: '1px solid rgba(111, 175, 61, 0.35)',
          borderRadius: '26px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          color: '#E7F1E1'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(231, 241, 225, 0.12)',
            background: 'rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'rgba(111, 175, 61, 0.2)',
                border: '1px solid #6FAF3D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6FAF3D'
              }}
            >
              <Camera size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                Scan Digital Pass
              </div>
              <div style={{ fontSize: 11.5, color: '#A9C5A2' }}>
                Live Host Desk Camera Viewfinder
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {torchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                className="btn btn-ghost btn-xs"
                style={{
                  color: torchOn ? '#FBBF24' : '#E7F1E1',
                  background: torchOn ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.08)',
                  padding: '6px 10px',
                  borderRadius: '99px'
                }}
                title={torchOn ? 'Turn flashlight off' : 'Turn flashlight on'}
              >
                {torchOn ? <Zap size={14} /> : <ZapOff size={14} />}
              </button>
            )}

            <button
              type="button"
              onClick={flipCamera}
              className="btn btn-ghost btn-xs"
              style={{
                color: '#E7F1E1',
                background: 'rgba(255,255,255,0.08)',
                padding: '6px 10px',
                borderRadius: '99px'
              }}
              title="Flip camera"
            >
              <FlipHorizontal size={14} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#E7F1E1',
                width: 32,
                height: 32,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewfinder Container */}
        <div style={{ position: 'relative', width: '100%', height: 290, background: '#05120B', overflow: 'hidden' }}>
          {/* Live Camera Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: hasCamera ? 'block' : 'none'
            }}
          />

          {/* Fallback Screen if Camera Access is Blocked / Unavailable */}
          {!hasCamera && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F87171',
                  marginBottom: 12
                }}
              >
                <AlertCircle size={26} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#F1F7EC', marginBottom: 4 }}>
                Camera Offline or Blocked
              </div>
              <p style={{ fontSize: 12, color: '#A9C5A2', maxWidth: 320, lineHeight: 1.45, margin: 0 }}>
                {cameraError || 'Device camera could not be started. Use quick test scan below to verify bookings.'}
              </p>
            </div>
          )}

          {/* Scanner Viewfinder Overlay */}
          {hasCamera && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              {/* Target Aiming Box */}
              <div
                style={{
                  position: 'relative',
                  width: 190,
                  height: 190,
                  borderRadius: 18,
                  border: '2px dashed rgba(111, 175, 61, 0.6)',
                  boxShadow: '0 0 0 4000px rgba(5, 18, 11, 0.55)',
                  overflow: 'hidden'
                }}
              >
                {/* 4 Corner L-Brackets */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, borderTop: '4px solid #6FAF3D', borderLeft: '4px solid #6FAF3D', borderTopLeftRadius: 10 }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22, borderTop: '4px solid #6FAF3D', borderRight: '4px solid #6FAF3D', borderTopRightRadius: 10 }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 22, height: 22, borderBottom: '4px solid #6FAF3D', borderLeft: '4px solid #6FAF3D', borderBottomLeftRadius: 10 }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderBottom: '4px solid #6FAF3D', borderRight: '4px solid #6FAF3D', borderBottomRightRadius: 10 }} />

                {/* Animated Laser Scanning Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 2.5,
                    background: 'linear-gradient(90deg, transparent, #6FAF3D, #93E949, #6FAF3D, transparent)',
                    boxShadow: '0 0 12px #6FAF3D, 0 0 20px #93E949',
                    animation: 'scannerLaser 2s ease-in-out infinite'
                  }}
                />
              </div>

              {/* Status Badge */}
              <div
                style={{
                  marginTop: 14,
                  padding: '4px 14px',
                  borderRadius: '99px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  border: '1px solid rgba(111, 175, 61, 0.4)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#E7F1E1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6FAF3D', boxShadow: '0 0 8px #6FAF3D' }} />
                Align student QR or pass within frame
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Scanned Result Details */}
        <div style={{ padding: '20px 22px', background: 'rgba(0, 0, 0, 0.2)' }}>
          {scannedResult ? (
            /* Result Success Card */
            <div
              className="anim-scale-in"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid #10B981',
                borderRadius: '16px',
                padding: '16px 18px',
                marginBottom: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34D399', fontWeight: 800, fontSize: 14 }}>
                  <CheckCircle2 size={18} />
                  <span>Digital Pass Verified</span>
                </div>
                <span style={{ fontSize: 11, color: '#A7F3D0', fontWeight: 700, background: 'rgba(16, 185, 129, 0.25)', padding: '2px 8px', borderRadius: 99 }}>
                  {scannedResult.code}
                </span>
              </div>

              {scannedResult.reservation ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 15, color: '#FFFFFF', marginBottom: 4 }}>
                    <User size={15} className="text-emerald-400" />
                    <span>{scannedResult.reservation.guestName}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#A7F3D0', marginBottom: 10 }}>
                    {scannedResult.reservation.guestEmail} · Table {scannedResult.reservation.tableAssigned || 'T-01'}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        flex: 1,
                        background: '#10B981',
                        color: '#062819',
                        fontWeight: 800,
                        border: 'none',
                        borderRadius: '99px',
                        padding: '8px 14px'
                      }}
                      onClick={() => {
                        if (onScanSuccess) onScanSuccess(scannedResult.code, scannedResult.reservation);
                        onClose();
                      }}
                    >
                      <Armchair size={15} /> Seat Guest Now
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#E7F1E1', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)' }}
                      onClick={() => setScannedResult(null)}
                    >
                      Scan Another
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12.5, color: '#F1F7EC', marginBottom: 12 }}>
                    Pass code <strong>{scannedResult.code}</strong> recognized. Ready to search or assign table.
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{
                      width: '100%',
                      background: '#10B981',
                      color: '#062819',
                      fontWeight: 800,
                      border: 'none',
                      borderRadius: '99px',
                      padding: '8px 14px'
                    }}
                    onClick={() => {
                      if (onScanSuccess) onScanSuccess(scannedResult.code, null);
                      onClose();
                    }}
                  >
                    View Matching Queue
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Simulation & Quick Pass Selectors */
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#A9C5A2', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Quick Test Pass Simulators
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {reservations.slice(0, 3).map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleMatchedPass(r.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(111, 175, 61, 0.3)',
                      color: '#E7F1E1',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.18s'
                    }}
                  >
                    <QrCode size={13} style={{ color: '#6FAF3D' }} />
                    <span>{r.id} ({r.guestName.split(' ')[0]})</span>
                  </button>
                ))}
              </div>

              {/* Manual Pass Code Input */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (manualCode) handleMatchedPass(manualCode);
                }}
                style={{ display: 'flex', gap: 8 }}
              >
                <input
                  type="text"
                  placeholder="Or enter pass reference (e.g. DB-4821)..."
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#FFFFFF',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '12px', padding: '0 16px', fontWeight: 700 }}
                >
                  Verify
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Laser Animation Keyframes */}
      <style>{`
        @keyframes scannerLaser {
          0% { top: 6%; opacity: 0.9; }
          50% { top: 90%; opacity: 1; }
          100% { top: 6%; opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
