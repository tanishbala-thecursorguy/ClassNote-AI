import React, { useEffect, useState } from "react";
import { ProgressStepper } from "../classnote/ProgressStepper";
import { transcribeAudio, type TranscriptionResponse, generateNotesFromTranscript, type NotesPayload } from "../../services/api";

interface ProcessingScreenProps {
  audioBlob: Blob;
  title: string;
  duration: string;
  onComplete: (transcription: TranscriptionResponse) => void;
  onError?: (error: string) => void;
}

export function ProcessingScreen({ audioBlob, title, duration, onComplete, onError }: ProcessingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stepLabels = [
    "Preparing transcript",
    "Transcribing lecture",
    "Analyzing content",
    "Generating summary",
    "Creating notes",
    "Finalizing"
  ];

  useEffect(() => {
    const processAudio = async () => {
      try {
        // Step 1: Preparing transcript
        setCurrentStep(0);

        let transcriptText = localStorage.getItem("liveTranscript") || "";
        let transcription: TranscriptionResponse;

        if (transcriptText && transcriptText.trim().length > 0) {
          // Use live transcript directly (AI-only backend path)
          transcription = {
            text: transcriptText.trim(),
            paragraphs: [],
            segments: [],
            metadata: { language: "en", language_probability: 1, duration: 0 },
          } as unknown as TranscriptionResponse;
          setCurrentStep(1); // advance from transcribing step
        } else {
          // Fallback to audio transcription (if backend supports it)
          // Step 2: Transcribing (with progress)
          transcription = await transcribeAudio(audioBlob, (progress) => {
            setUploadProgress(progress);
            if (progress === 100 && currentStep === 0) {
              setCurrentStep(1);
            }
          });
        }
        
        // Step 3: Analyzing content -> Generate notes from transcript using app-level API
        setCurrentStep(2);
        console.log("Generating notes from transcript:", transcription.text.substring(0, 100) + "...");
        const notes: NotesPayload = await generateNotesFromTranscript(transcription.text, title);
        console.log("Notes generated successfully:", {
          hasSummary: notes.summary_bullets?.length || 0,
          hasNotes: notes.notes_markdown?.length || 0,
          quizCount: notes.quiz?.length || 0
        });

        // Store complete data in localStorage
        try {
          localStorage.setItem("lastNotes", JSON.stringify(notes));
          localStorage.setItem("lastTranscript", transcription.text);
          console.log("Stored notes and transcript in localStorage");
          
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('notesUpdated', { detail: { notes, transcript: transcription.text } }));
        } catch (err) {
          console.error("Failed to store in localStorage:", err);
        }

        // Attach notes to transcription object for downstream screens
        (transcription as any).notes = notes;
        
        // Steps 4-5 visual
        setCurrentStep(3);
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentStep(4);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCurrentStep(5);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Complete
        onComplete(transcription);
      } catch (err) {
        console.error("Processing error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to process audio";
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
    };

    processAudio();
  }, [audioBlob, onComplete, onError]);

  const steps = stepLabels.map((label, index) => ({
    label,
    status: index < currentStep ? "complete" : index === currentStep ? "active" : "pending"
  })) as Array<{ label: string; status: "pending" | "active" | "complete" }>;

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {error ? (
          // Error State
          <div className="text-center">
            <div className="mb-6 p-4 bg-[#DC2626]/10 border border-[#DC2626] rounded-lg">
              <h3 className="text-[#DC2626] font-semibold mb-2">Processing Failed</h3>
              <p className="text-[#DC2626] text-sm">{error}</p>
            </div>
            <p className="text-[#A6A8AD] text-sm">
              Please try recording again or check your internet connection.
            </p>
          </div>
        ) : (
          // Processing State
          <>
            <div className="text-center mb-12">
              <h2 className="text-[#F5F7FA] mb-3">Processing Your Lecture</h2>
              <p className="text-[#A6A8AD]">
                We're turning this lecture into gold...
              </p>
              <p className="text-[#A6A8AD] text-sm mt-2">
                "{title}" • {duration}
              </p>
            </div>

            <ProgressStepper steps={steps} />

            {/* Upload progress indicator */}
            {currentStep === 0 && uploadProgress > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-[#A6A8AD] mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-[#2A2C31] rounded-full h-2">
                  <div 
                    className="bg-[#F5F7FA] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-12 text-center">
              <p className="text-[#A6A8AD] text-sm">
                This usually takes 1-2 minutes depending on lecture length
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
