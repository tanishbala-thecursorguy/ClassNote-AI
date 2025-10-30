import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { MarkdownRenderer } from "../ui/markdown-renderer";

interface QuizScreenProps {
  onBack: () => void;
}

type QuizItem = {
  question: string;
  options?: Record<string, string>;
  answer?: string;
  explanation?: string;
};

export default function QuizScreen({ onBack }: QuizScreenProps) {
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastNotes");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.quiz)) {
          setQuiz(parsed.quiz);
        }
      }
    } catch {}
  }, []);

  const total = quiz.length;
  const correctCount = useMemo(() => {
    return quiz.reduce((acc, q, idx) => {
      const sel = selected[idx];
      if (!submitted[idx]) return acc;
      if (sel && q.answer && sel.toUpperCase() === q.answer.toUpperCase()) return acc + 1;
      return acc;
    }, 0);
  }, [quiz, selected, submitted]);

  const handleSelect = (idx: number, key: string) => {
    setSelected((s) => ({ ...s, [idx]: key }));
  };

  const handleSubmit = (idx: number) => {
    setSubmitted((s) => ({ ...s, [idx]: true }));
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-[#2A2C31]">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-[#1C1D20]">
          <ChevronLeftIcon className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-white text-xl">Quiz</h1>
        <div className="ml-auto text-sm text-[#A6A8AD]">
          {submitted ? `${correctCount}/${total} correct` : `${total} questions`}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {quiz.length === 0 ? (
          <p className="text-[#A6A8AD]">No quiz found. Generate notes first.</p>
        ) : (
          quiz.map((q, idx) => {
            const opts = q.options || {};
            const entries = Object.entries(opts);
            const sel = selected[idx];
            const isSubmitted = submitted[idx];
            const isCorrect = sel && q.answer && sel.toUpperCase() === q.answer.toUpperCase();
            return (
              <div key={idx} className="bg-[#121315] border border-[#2A2C31] rounded-2xl p-4">
                <div className="text-white mb-3">
                  <MarkdownRenderer content={`${idx + 1}. ${q.question}`} />
                </div>
                <div className="space-y-2">
                  {entries.length > 0 ? (
                    entries.map(([key, val]) => {
                      const chosen = sel === key;
                      const correct = isSubmitted && q.answer && key.toUpperCase() === q.answer.toUpperCase();
                      const wrong = isSubmitted && chosen && !correct;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelect(idx, key)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                            chosen ? "border-white/40 bg-white/5" : "border-[#2A2C31] bg-transparent"
                          } ${correct ? "border-green-500/60" : ""} ${wrong ? "border-red-500/60" : ""}`}
                        >
                          <span className="text-[#A6A8AD] mr-2">{key})</span>
                          <span className="text-white">{val}</span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-[#A6A8AD] text-sm">No options provided.</p>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {!isSubmitted ? (
                    <Button onClick={() => handleSubmit(idx)} className="bg-white text-black hover:bg-white/90">
                      Submit
                    </Button>
                  ) : (
                    <span className={`text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  )}
                </div>
                {isSubmitted && q.explanation && (
                  <div className="mt-3 text-[#A6A8AD] text-sm">
                    <MarkdownRenderer content={`Explanation: ${q.explanation}`} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


