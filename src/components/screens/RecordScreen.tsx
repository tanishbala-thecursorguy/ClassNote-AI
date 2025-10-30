import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, Battery, Volume2, Tag, Camera, Pause, Square, Play } from "lucide-react";
import { RecordButton } from "../classnote/RecordButton";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Squares } from "../ui/squares-background";

interface RecordScreenProps {
  onBack: () => void;
  onComplete: (duration: string, audioBlob: Blob, title: string, markers: Marker[]) => void;
}

interface Marker {
  time: string;
  type: "Key Point" | "Assignment" | "Exam Tip";
}

export function RecordScreen({ onBack, onComplete }: RecordScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const lastResultAtRef = useRef<number>(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const cycleDeadlineRef = useRef<number>(0);

  // Timer effect - only runs when recording and not paused
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [liveTranscript, interimTranscript]);

  // Request microphone permission automatically on mount
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone permission granted");
      } catch (err) {
        console.error("Microphone permission denied:", err);
        setError("Microphone access is required for recording. Please allow microphone permissions.");
      }
    };
    requestMicPermission();
  }, []);

  // Initialize Web Speech API for live transcription
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setLiveTranscript(prev => prev + final);
          setInterimTranscript('');
          lastResultAtRef.current = Date.now();
        } else {
          setInterimTranscript(interim);
          if (interim) {
            lastResultAtRef.current = Date.now();
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart recognition if no speech detected
          if (isRecording && !isPaused) {
            recognition.start();
          }
        } else if (event.error === 'aborted' || event.error === 'network' || event.error === 'audio-capture') {
          if (isRecording && !isPaused) {
            try { recognition.stop(); } catch {}
            setTimeout(() => { try { recognition.start(); } catch {} }, 200);
          }
        }
      };

      recognition.onend = () => {
        // Restart recognition if still recording
        if (isRecording && !isPaused) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        }
      };

      recognitionRef.current = recognition;
      cycleDeadlineRef.current = Date.now() + 25000;
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Control speech recognition based on recording state
  useEffect(() => {
    if (recognitionRef.current) {
      if (isRecording && !isPaused) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started
        }
      } else {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Already stopped
        }
      }
    }
  }, [isRecording, isPaused]);

  // Watchdog: guard against Chrome recognition stalling + hard cycle
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (!isRecording || isPaused || !recognitionRef.current) return;
      const now = Date.now();
      // If no result for 5s, soft-restart
      if (lastResultAtRef.current && now - lastResultAtRef.current > 5000) {
        try { recognitionRef.current.stop(); } catch {}
        setTimeout(() => { try { recognitionRef.current?.start(); } catch {} }, 200);
        lastResultAtRef.current = now;
      }
      // Hard cycle every 25s
      if (cycleDeadlineRef.current && now > cycleDeadlineRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        setTimeout(() => {
          try { recognitionRef.current?.start(); } catch {}
          cycleDeadlineRef.current = Date.now() + 25000;
        }, 250);
      }
      // Persist progressively for long sessions
      if (liveTranscript && liveTranscript.length % 400 === 0) {
        try { localStorage.setItem('liveTranscript', liveTranscript); } catch {}
      }
    }, 2000);
    return () => clearInterval(watchdog);
  }, [isRecording, isPaused, liveTranscript]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus"
        });
        
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      setIsPaused(false);
        setError(null);
      setLiveTranscript("");
      setInterimTranscript("");
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Could not access microphone. Please check permissions.");
      }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && 
        (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
      setShowTitleDialog(true);
    }
  };

  const handleAddMarker = (type: "Key Point" | "Assignment" | "Exam Tip") => {
    setMarkers([...markers, { time: formatTime(elapsedTime), type }]);
    setShowMarkerDialog(false);
  };

  const handleSave = () => {
    if (lectureTitle.trim() && audioChunksRef.current.length > 0) {
      // Create audio blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      
      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping speech recognition:", e);
        }
      }
      
      // Stop all media tracks
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Save live transcript to localStorage for the processing screen
      if (liveTranscript) {
        localStorage.setItem('liveTranscript', liveTranscript);
      }
      
      onComplete(formatTime(elapsedTime), audioBlob, lectureTitle, markers);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col relative">
      {/* Squares Background - only visible during recording */}
      {isRecording && (
        <div className="absolute inset-0 z-0">
          <Squares 
            direction="diagonal"
            speed={0.5}
            squareSize={40}
            borderColor="#333" 
            hoverFillColor="#222"
          />
        </div>
      )}
      
      {/* Header */}
      <div className="relative z-10 bg-[#121315] border-b border-[#2A2C31] px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#2A2C31] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#F5F7FA]" />
          </button>
          <h2 className="text-[#F5F7FA]">Record Lecture</h2>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-[#DC2626]/10 border border-[#DC2626] rounded-lg max-w-md w-full">
            <p className="text-[#DC2626] text-sm">{error}</p>
          </div>
        )}
        {/* Pre-recording Checklist */}
        {!isRecording && elapsedTime === 0 && (
          <div className="max-w-md w-full space-y-4 mb-8">
            <div className="flex items-center gap-3 text-[#E5E7EB]">
              <Mic className="w-5 h-5 text-[#A6A8AD]" />
              <span>Microphone ready</span>
            </div>
            <div className="flex items-center gap-3 text-[#E5E7EB]">
              <Battery className="w-5 h-5 text-[#A6A8AD]" />
              <span>Battery level good</span>
            </div>
            <div className="flex items-center gap-3 text-[#E5E7EB]">
              <Volume2 className="w-5 h-5 text-[#A6A8AD]" />
              <span>Environment quiet</span>
            </div>
          </div>
        )}

        {/* Recording UI */}
        <div className="text-center mb-8">
          <div className="text-5xl text-[#F5F7FA] mb-2 font-mono">
            {formatTime(elapsedTime)}
          </div>
          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-[#A6A8AD]">
              <div className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
              <span className="text-sm">{isPaused ? "Paused" : "Recording"}</span>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        {!isRecording ? (
          <RecordButton isRecording={false} onToggle={handleStartRecording} />
        ) : (
          <div className="flex gap-4 mb-6">
            {/* Pause/Resume Button */}
            <Button
              onClick={isPaused ? handleResumeRecording : handlePauseRecording}
              className={`h-16 px-8 rounded-2xl text-lg font-medium transition-all ${
                isPaused
                  ? "bg-[#10B981] hover:bg-[#059669] text-white"
                  : "bg-[#F59E0B] hover:bg-[#D97706] text-white"
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-6 h-6 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-6 h-6 mr-2" />
                  Pause
                </>
              )}
            </Button>

            {/* Stop Button */}
            <Button
              onClick={handleStopRecording}
              className="h-16 px-8 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-2xl text-lg font-medium transition-all"
            >
              <Square className="w-6 h-6 mr-2" />
              Stop Recording
            </Button>
          </div>
        )}

        {/* Live Transcription */}
        {isRecording && (
          <div className="w-full max-w-2xl mt-8 mb-6">
            <div className="bg-[#121315] border border-[#2A2C31] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#F5F7FA] font-medium flex items-center gap-2">
                  <Mic className="w-5 h-5 text-[#10B981]" />
                  Live Transcription
                </h3>
                {recognitionRef.current && (
                  <Badge className="bg-[#10B981]/10 text-[#10B981] border-0">
                    Active
                  </Badge>
                )}
              </div>
              
              <div 
                ref={transcriptScrollRef}
                className="text-[#E5E7EB] leading-relaxed pr-4 h-48 overflow-y-auto rounded-lg bg-[#0B0B0C]/50 p-4"
              >
                {liveTranscript || interimTranscript ? (
                  <>
                    <span>{liveTranscript}</span>
                    {interimTranscript && (
                      <span className="text-[#A6A8AD] italic">{interimTranscript}</span>
                    )}
                  </>
                ) : (
                  <p className="text-[#A6A8AD] italic">
                    {isPaused ? "Transcription paused..." : "Start speaking to see live transcription..."}
                  </p>
                )}
              </div>
              
              {liveTranscript && (
                <div className="mt-4 pt-4 border-t border-[#2A2C31]">
                  <p className="text-[#A6A8AD] text-sm">
                    {liveTranscript.split(' ').length} words transcribed
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {isRecording && (
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => setShowMarkerDialog(true)}
              variant="outline"
              className="bg-transparent border-[#2A2C31] text-[#F5F7FA] hover:bg-[#1C1D20] rounded-xl"
            >
              <Tag className="w-4 h-4 mr-2" />
              Add Marker
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-[#2A2C31] text-[#F5F7FA] hover:bg-[#1C1D20] rounded-xl"
            >
              <Camera className="w-4 h-4 mr-2" />
              Add Slide
            </Button>
          </div>
        )}

        {/* Markers List */}
        {markers.length > 0 && (
          <div className="mt-8 w-full max-w-md space-y-2">
            <p className="text-[#A6A8AD] text-sm mb-3">Markers ({markers.length})</p>
            {markers.map((marker, index) => (
              <div key={index} className="bg-[#121315] border border-[#2A2C31] rounded-lg p-3 flex items-center justify-between">
                <Badge className="bg-[#2A2C31] text-[#F5F7FA] border-0 rounded-lg">
                  {marker.type}
                </Badge>
                <span className="text-[#A6A8AD] text-sm">{marker.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Marker Dialog */}
      <Dialog open={showMarkerDialog} onOpenChange={setShowMarkerDialog}>
        <DialogContent className="bg-[#1C1D20] border-[#2A2C31] text-[#F5F7FA]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F7FA]">Add Marker</DialogTitle>
            <DialogDescription className="text-[#A6A8AD]">
              Choose marker type
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Button
              onClick={() => handleAddMarker("Key Point")}
              className="w-full justify-start bg-[#121315] hover:bg-[#2A2C31] text-[#F5F7FA] border border-[#2A2C31]"
            >
              Key Point
            </Button>
            <Button
              onClick={() => handleAddMarker("Assignment")}
              className="w-full justify-start bg-[#121315] hover:bg-[#2A2C31] text-[#F5F7FA] border border-[#2A2C31]"
            >
              Assignment
            </Button>
            <Button
              onClick={() => handleAddMarker("Exam Tip")}
              className="w-full justify-start bg-[#121315] hover:bg-[#2A2C31] text-[#F5F7FA] border border-[#2A2C31]"
            >
              Exam Tip
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Title Dialog */}
      <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
        <DialogContent className="bg-[#1C1D20] border-[#2A2C31] text-[#F5F7FA]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F7FA]">Save Recording</DialogTitle>
            <DialogDescription className="text-[#A6A8AD]">
              Give your lecture a title
            </DialogDescription>
          </DialogHeader>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="e.g., Greedy vs Dynamic Programming"
            className="bg-[#121315] border-[#2A2C31] text-[#F5F7FA] placeholder:text-[#A6A8AD]"
          />
          <DialogFooter>
            <Button
              onClick={() => setShowTitleDialog(false)}
              variant="outline"
              className="bg-transparent border-[#2A2C31] text-[#F5F7FA] hover:bg-[#1C1D20]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!lectureTitle.trim()}
              className="bg-[#F5F7FA] text-[#0B0B0C] hover:bg-[#E5E7EB]"
            >
              Save & Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
