import { Lock, Unlock, Key } from 'lucide-react';
import { useState, useEffect } from 'react';

const FILES = [
  { id: 'DOC-001', name: 'SIGINT_CAPTURE_0312.enc', size: '4.2KB', decrypted: false, content: 'FIELD AGENT REPORT: Mobile launcher unit observed heading NNE. Est. arrival at staging area T+4h. Requesting airstrike corridor deconfliction.' },
  { id: 'DOC-002', name: 'INTEL_BRIEF_Tehran.enc', size: '7.8KB', decrypted: false, content: 'HUMINT SOURCE: Meeting between IRGC-N Commander and proxy group leader confirmed. Agenda included munitions transfer and safe-house logistics.' },
  { id: 'DOC-003', name: 'COMMS_INTERCEPT_0310.enc', size: '2.1KB', decrypted: false, content: 'SIGINT INTERCEPT: Encoded VHF burst from Fordow perimeter guard. Partial decrypt suggests schedule change for external inspectors.' },
];

const genHex = (len: number) => Array.from({ length: len }).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(' ');

export const DecryptorApp = () => {
  const [files] = useState(FILES);
  const [activeFile, setActiveFile] = useState<typeof FILES[0] | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hex, setHex] = useState('');

  useEffect(() => {
    if (!decrypting) return;
    const int = setInterval(() => {
      setHex(genHex(32));
      setProgress(p => {
        if (p >= 100) { clearInterval(int); setDecrypting(false); return 100; }
        return p + 3;
      });
    }, 60);
    return () => clearInterval(int);
  }, [decrypting]);

  const startDecrypt = (file: typeof FILES[0]) => {
    setActiveFile(file);
    setProgress(0);
    setDecrypting(true);
    setHex(genHex(32));
  };

  const isDecrypted = activeFile && progress >= 100;

  return (
    <div className="flex h-full bg-primary overflow-hidden" style={{ backgroundColor: '#030712' }}>
      {/* File list */}
      <div className="w-64 border-r border-color flex flex-col p-4 gap-3" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
        <div className="text-xs font-mono font-bold pb-2 border-b border-color" style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }}>
          ENCRYPTED FILES ({FILES.length})
        </div>
        {files.map(f => (
          <button
            key={f.id}
            onClick={() => startDecrypt(f)}
            className="text-left p-3 rounded border transition-all hover:scale-105"
            style={{
              borderColor: activeFile?.id === f.id ? '#10b981' : 'rgba(16,185,129,0.15)',
              background: activeFile?.id === f.id ? 'rgba(16,185,129,0.08)' : 'transparent',
              color: '#10b981'
            }}
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold mb-1">
              <Lock size={11} /> {f.id}
            </div>
            <div className="text-[10px] opacity-60 truncate">{f.name}</div>
            <div className="text-[10px] opacity-50">{f.size}</div>
          </button>
        ))}
      </div>

      {/* Decrypt console */}
      <div className="flex-1 p-6 flex flex-col font-mono" style={{ color: '#10b981' }}>
        {!activeFile ? (
          <div className="flex-1 flex items-center justify-center text-center opacity-40">
            <div><Key size={48} className="mx-auto mb-4 opacity-50" /><p className="text-sm">Select an encrypted file to begin decryption sequence.</p></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold">{activeFile.name}</div>
              <div className="flex items-center gap-2 text-xs">
                {isDecrypted ? <Unlock size={14} className="text-green-400" /> : <Lock size={14} className="animate-pulse" />}
                {isDecrypted ? 'DECRYPTED' : `DECRYPTING... ${progress}%`}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <div className="h-full transition-all rounded-full" style={{ width: `${progress}%`, background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            </div>

            {/* Hex stream / decrypted content */}
            <div className="flex-1 bg-black rounded border p-4 overflow-auto text-xs leading-relaxed" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
              {isDecrypted ? (
                <div>
                  <div className="text-green-400 mb-3 border-b border-green-900 pb-2">DECRYPTION COMPLETE — CLEARANCE LEVEL: TOP SECRET</div>
                  <div className="text-green-200 leading-relaxed">{activeFile.content}</div>
                </div>
              ) : (
                <div className="break-all opacity-70" style={{ wordSpacing: '0.3em' }}>
                  {hex}
                  <span className="animate-pulse">█</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
