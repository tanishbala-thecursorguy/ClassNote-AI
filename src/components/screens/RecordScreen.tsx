import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, Battery, Volume2, Tag, Camera } from "lucide-react";
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setShowTitleDialog(true);
    } else {
      // Start recording
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
        setError(null);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Could not access microphone. Please check permissions.");
      }
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
      
      // Stop all media tracks
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      onComplete(formatTime(elapsedTime), audioBlob, lectureTitle, markers);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col">
      {/* Header */}
      <div className="bg-[#121315] border-b border-[#2A2C31] px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#2A2C31] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#F5F7FA]" />
          </button>
          <h2 className="text-[#F5F7FA]">Record Lecture</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
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
              <span className="text-sm">Recording</span>
            </div>
          )}
        </div>

        <RecordButton isRecording={isRecording} onToggle={handleToggleRecording} />

        {/* Actions */}
        {isRecording && (
          <div className="mt-12 flex gap-3">
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
