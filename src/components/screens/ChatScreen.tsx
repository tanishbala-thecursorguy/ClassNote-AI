import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronLeftIcon, User, Bot } from "lucide-react";
import { Squares } from "../ui/squares-background";
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from "../ui/chat-input";
import { TypewriterEffect } from "../ui/typewriter-effect";
import { MarkdownRenderer } from "../ui/markdown-renderer";

interface ChatScreenProps {
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8001";

export function ChatScreen({ onBack }: ChatScreenProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (message.trim() && !isLoading) {
      const userMessage = message.trim();
      setMessage("");
      
      // Add user message to chat
      const newUserMessage: Message = { role: "user", content: userMessage };
      setMessages(prev => [...prev, newUserMessage]);
      setIsLoading(true);
      setIsThinking(true);

      try {
        // Prepare conversation history for API
        const conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Add current user message to history
        conversationHistory.push({ role: "user", content: userMessage });

        const response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            conversation_history: conversationHistory
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to get response");
        }

        const data = await response.json();
        
        // Stop thinking indicator
        setIsThinking(false);
        setIsLoading(false);
        
        // Add assistant response to chat with typing effect
        const assistantMessage: Message = { 
          role: "assistant", 
          content: data.message,
          isTyping: true
        };
        const newMessageIndex = messages.length;
        setMessages(prev => [...prev, assistantMessage]);
        setTypingMessageId(newMessageIndex);
      } catch (error: any) {
        console.error("Chat error:", error);
        setIsThinking(false);
        setIsLoading(false);
        const errorMessage: Message = {
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message || "An error occurred"}. Please try again.`
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col relative">
      {/* Squares Background - always visible */}
      <div className="absolute inset-0 z-0">
        <Squares 
          direction="diagonal"
          speed={0.3}
          squareSize={50}
          borderColor="#333" 
          hoverFillColor="#222"
        />
      </div>
      
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-800 relative z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-white hover:bg-gray-800"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-white">AI Assistant</h1>
      </div>
      
      {/* Chat Messages Area - takes up remaining space */}
      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Messages Container */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
        >
          {messages.length === 0 ? (
            /* Welcome Message - shown when no messages */
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <Bot className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <h2 className="text-2xl font-medium text-white mb-2">
                  Hey there! 👋
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  I'm your friendly study buddy! Feel free to chat about anything - academic topics, daily tasks, or just say hi! I'll help with your studies and even remind you about tasks.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setMessage("Hi! How are you?")}
                    className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
                    Say Hi 👋
                  </button>
                  <button
                    onClick={() => setMessage("Explain quantum mechanics")}
                    className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
                    Study Help 📚
                  </button>
                  <button
                    onClick={() => setMessage("I have a task due tomorrow")}
                    className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
                    Task Reminder ⏰
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-white/10 text-white"
                      : "bg-white/5 text-white border border-white/10"
                  }`}
                >
                  {msg.role === "assistant" && typingMessageId === index && msg.isTyping ? (
                    <div className="text-sm">
                      <TypewriterEffect
                        text={msg.content}
                        speed={60}
                        onComplete={() => {
                          setTypingMessageId(null);
                          setMessages(prev => prev.map((m, i) => 
                            i === index ? { ...m, isTyping: false } : m
                          ));
                        }}
                      />
                    </div>
                  ) : msg.role === "assistant" ? (
                    <div className="text-sm">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/5 text-white border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 italic">Thinking...</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && !isThinking && !typingMessageId && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/5 text-white border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input at absolute bottom */}
        <div className="w-full p-4">
          <div className="w-full max-w-2xl mx-auto">
            <ChatInput
              variant="default"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onSubmit={handleSubmit}
              loading={isLoading}
              onStop={() => setIsLoading(false)}
              className="bg-white/5 border-white/10 backdrop-blur-sm"
            >
              <ChatInputTextArea 
                placeholder="Say hi, ask a question, or share your tasks..." 
                className="text-white placeholder:text-white/40 bg-transparent border-none"
              />
              <ChatInputSubmit className="bg-white text-black hover:bg-white/90" />
            </ChatInput>
          </div>
        </div>
      </div>
    </div>
  );
}
