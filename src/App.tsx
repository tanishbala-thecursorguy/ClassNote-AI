import React, { useState, useEffect } from "react";
import { HomeScreen } from "./components/screens/HomeScreen";
import { RecordScreen } from "./components/screens/RecordScreen";
import { ProcessingScreen } from "./components/screens/ProcessingScreen";
import { SessionDetailScreen } from "./components/screens/SessionDetailScreen";
import { SettingsScreen } from "./components/screens/SettingsScreen";
import { DesktopViewer } from "./components/screens/DesktopViewer";
import { IntroAnimationScreen } from "./components/screens/IntroAnimationScreen";
import { GetStartedScreen } from "./components/screens/GetStartedScreen";
import { OrganizationLoginScreen } from "./components/screens/OrganizationLoginScreen";
import { DottedSurfaceDemo } from "./components/ui/dotted-surface-demo";
import TestRecorder from "./pages/TestRecorder";
import type { LectureCardProps } from "./components/classnote/LectureCard";
import type { TranscriptionResponse } from "./services/api";

interface RecordingData {
  audioBlob: Blob;
  title: string;
  duration: string;
}

type Screen = 
  | { type: "intro-animation" }
  | { type: "get-started" }
  | { type: "login" }
  | { type: "dotted-surface" }
  | { type: "home" }
  | { type: "record" }
  | { type: "processing"; recordingData: RecordingData }
  | { type: "session"; sessionId: string }
  | { type: "settings" }
  | { type: "desktop" }
  | { type: "test-recorder" };

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: "get-started" }); // Start directly on get-started for testing
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Debug current screen
  console.log('Current screen:', currentScreen);
  
  const [lectures, setLectures] = useState<LectureCardProps[]>([
    {
      id: "1",
      title: "Greedy vs Dynamic Programming",
      course: "CS101 – Intro to Algorithms",
      duration: "52:18",
      date: "Oct 9, 2025",
      status: "Ready",
      onClick: () => {},
    },
    {
      id: "2",
      title: "Graph Theory Fundamentals",
      course: "CS101 – Intro to Algorithms",
      duration: "48:35",
      date: "Oct 7, 2025",
      status: "Ready",
      onClick: () => {},
    },
    {
      id: "3",
      title: "Sorting Algorithms Deep Dive",
      course: "CS101 – Intro to Algorithms",
      duration: "56:12",
      date: "Oct 5, 2025",
      status: "Processing",
      onClick: () => {},
    },
  ]);

  // Check if desktop view
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const handleIntroComplete = () => {
    setCurrentScreen({ type: "get-started" });
  };

  const handleGetStarted = () => {
    console.log('Get Started clicked - going to login survey');
    setCurrentScreen({ type: "login" });
  };

  const handleLogin = () => {
    console.log('Login successful - going to DottedSurface');
    setCurrentScreen({ type: "dotted-surface" });
  };

  const handleDottedSurfaceComplete = () => {
    console.log('DottedSurface completed - going to main app');
    setHasOnboarded(true);
    if (isDesktop) {
      setCurrentScreen({ type: "desktop" });
    } else {
      setCurrentScreen({ type: "home" });
    }
  };

  const handleTestDottedSurface = () => {
    console.log('Test button clicked - going directly to DottedSurface');
    setCurrentScreen({ type: "dotted-surface" });
  };

  const handleBackToGetStarted = () => {
    setCurrentScreen({ type: "get-started" });
  };


  const handleNewRecording = () => {
    setCurrentScreen({ type: "record" });
  };

  const handleCompleteRecording = (
    duration: string, 
    audioBlob: Blob, 
    title: string
  ) => {
    // Add new lecture
    const newLecture: LectureCardProps = {
      id: Date.now().toString(),
      title: title,
      course: "CS101 – Intro to Algorithms",
      duration: duration,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Processing",
      onClick: () => {},
    };
    setLectures(prev => [newLecture, ...prev]);
    setCurrentScreen({ 
      type: "processing", 
      recordingData: { audioBlob, title, duration }
    });
  };

  const handleProcessingComplete = (transcription: TranscriptionResponse) => {
    // Store transcription data (in a real app, save to database/storage)
    console.log("Transcription complete:", transcription);
    
    // Update the first lecture to Ready status
    setLectures(prev => prev.map((lecture, index) => 
      index === 0 ? { ...lecture, status: "Ready" as const } : lecture
    ));
    
    // Navigate back to home
    if (isDesktop) {
      setCurrentScreen({ type: "desktop" });
    } else {
      setCurrentScreen({ type: "home" });
    }
  };

  const handleProcessingError = (error: string) => {
    console.error("Processing error:", error);
    // Remove the failed lecture or mark it as failed
    setLectures(prev => prev.slice(1));
    // Return to home screen
    if (isDesktop) {
      setCurrentScreen({ type: "desktop" });
    } else {
      setCurrentScreen({ type: "home" });
    }
  };

  const handleSelectLecture = (id: string) => {
    setCurrentScreen({ type: "session", sessionId: id });
  };

  const handleBackToHome = () => {
    if (isDesktop) {
      setCurrentScreen({ type: "desktop" });
    } else {
      setCurrentScreen({ type: "home" });
    }
  };

  const handleSettings = () => {
    setCurrentScreen({ type: "settings" });
  };

  const handleTestRecorder = () => {
    setCurrentScreen({ type: "test-recorder" });
  };

  // Update lectures with onClick handlers
  const lecturesWithHandlers = lectures.map(lecture => ({
    ...lecture,
    onClick: () => handleSelectLecture(lecture.id),
  }));

  // Render desktop view if viewport is large enough and user has onboarded
  if (hasOnboarded && isDesktop && currentScreen.type === "desktop") {
    return <DesktopViewer lectures={lecturesWithHandlers} onNewRecording={handleNewRecording} onSettings={handleSettings} />;
  }

  // Mobile screens
  switch (currentScreen.type) {
    case "intro-animation":
      return <IntroAnimationScreen onComplete={handleIntroComplete} />;
    
    case "get-started":
      return <GetStartedScreen onGetStarted={handleGetStarted} />;
    
    case "login":
      return <OrganizationLoginScreen onBack={handleBackToGetStarted} onLogin={handleLogin} />;
    
    case "dotted-surface":
      return <DottedSurfaceDemo onContinue={handleDottedSurfaceComplete} />;
    
    case "home":
      return (
        <HomeScreen
          lectures={lecturesWithHandlers}
          onNewRecording={handleNewRecording}
          onSelectLecture={handleSelectLecture}
          onSettings={handleSettings}
        />
      );
    
    case "record":
      return (
        <RecordScreen
          onBack={handleBackToHome}
          onComplete={handleCompleteRecording}
        />
      );
    
    case "processing":
      return (
        <ProcessingScreen 
          audioBlob={currentScreen.recordingData.audioBlob}
          title={currentScreen.recordingData.title}
          duration={currentScreen.recordingData.duration}
          onComplete={handleProcessingComplete}
          onError={handleProcessingError}
        />
      );
    
    case "session":
      const selectedLecture = lectures.find(l => l.id === currentScreen.sessionId);
      if (!selectedLecture) {
        setCurrentScreen({ type: "home" });
        return null;
      }
      return (
        <SessionDetailScreen
          sessionId={currentScreen.sessionId}
          title={selectedLecture.title}
          course={selectedLecture.course}
          date={selectedLecture.date}
          duration={selectedLecture.duration}
          onBack={handleBackToHome}
        />
      );
    
    case "settings":
      return <SettingsScreen onBack={handleBackToHome} onTestRecorder={handleTestRecorder} />;
    
    case "test-recorder":
      return <TestRecorder onBack={handleBackToHome} />;
    
    default:
      return <HomeScreen
        lectures={lecturesWithHandlers}
        onNewRecording={handleNewRecording}
        onSelectLecture={handleSelectLecture}
        onSettings={handleSettings}
      />;
  }
}
