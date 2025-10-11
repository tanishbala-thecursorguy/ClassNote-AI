import { useRef, useState } from 'react';

interface QuickRecorderProps {
  onDone: (res: any) => void;
  className?: string;
}

export default function QuickRecorder({ onDone, className = "" }: QuickRecorderProps) {
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mr.ondataavailable = e => { 
        if (e.data.size) chunks.current.push(e.data); 
      };
      
      mr.onstop = async () => {
        setBusy(true);
        try {
          const blob = new Blob(chunks.current, { type: 'audio/webm' });
          chunks.current = [];
          
          const res = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: await blob.arrayBuffer()
          });
          
          if (!res.ok) {
            throw new Error(`Processing failed: ${res.statusText}`);
          }
          
          const data = await res.json();
          setBusy(false);
          onDone?.(data);
        } catch (err) {
          setBusy(false);
          setError(err instanceof Error ? err.message : 'Processing failed');
        }
      };
      
      mr.start();
      recRef.current = mr;
      setRecording(true);
    } catch (err) {
      setError('Microphone access denied or not available');
    }
  }

  function stop() { 
    recRef.current?.stop(); 
    setRecording(false); 
  }

  return (
    <div className={`p-5 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 ${className}`}>
      <div className="mb-3 text-center">
        {error ? (
          <span className="text-red-400">{error}</span>
        ) : busy ? (
          <span className="text-blue-400">Processing...</span>
        ) : recording ? (
          <span className="text-red-400">Recording...</span>
        ) : (
          <span className="text-green-400">Ready to record</span>
        )}
      </div>
      
      <button
        onClick={recording ? stop : start}
        className="w-full px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={busy}
      >
        {recording ? 'Stop & Process' : 'Start Recording'}
      </button>
      
      {busy && (
        <div className="mt-3 text-center text-sm text-zinc-400">
          Transcribing audio and generating AI notes...
        </div>
      )}
    </div>
  );
}
