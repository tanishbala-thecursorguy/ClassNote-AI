import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import QuickRecorder from '../components/QuickRecorder';

interface TestRecorderProps {
  onBack?: () => void;
}

export default function TestRecorder({ onBack }: TestRecorderProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRecordingComplete = (data: any) => {
    setResult(data);
    setLoading(false);
    console.log('Recording complete:', data);
  };

  const handleRecordingStart = () => {
    setLoading(true);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Header */}
      <div className="bg-[#121315] border-b border-[#2A2C31] px-6 py-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-[#2A2C31] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#F5F7FA]" />
            </button>
          )}
          <h1 className="text-[#F5F7FA]">QuickRecorder Test</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#F5F7FA] mb-8">
            Test Supabase-Integrated Recording
          </h2>

        <div className="mb-8">
          <QuickRecorder 
            onDone={handleRecordingComplete}
            className="max-w-md mx-auto"
          />
        </div>

        {loading && (
          <div className="text-center text-[#A6A8AD] mb-6">
            Processing your recording...
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Recording Info */}
            <div className="bg-[#121315] border border-[#2A2C31] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#F5F7FA] mb-4">
                Recording Complete! ✅
              </h2>
              <p className="text-[#A6A8AD] mb-2">
                <strong>Recording ID:</strong> {result.recording_id}
              </p>
              <p className="text-[#A6A8AD]">
                Saved to Supabase database with full transcript and AI-generated notes.
              </p>
            </div>

            {/* Transcript */}
            {result.transcript && (
              <div className="bg-[#121315] border border-[#2A2C31] rounded-xl p-6">
                <h2 className="text-xl font-semibold text-[#F5F7FA] mb-4">
                  Transcript
                </h2>
                <div className="space-y-3">
                  {result.transcript.paragraphs.map((paragraph: string, index: number) => (
                    <p key={index} className="text-[#E5E7EB] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* AI Notes */}
            {result.notes && (
              <div className="space-y-6">
                {/* Key Takeaways */}
                {result.notes.summary?.keyTakeaways && (
                  <div className="bg-[#121315] border border-[#2A2C31] rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-[#F5F7FA] mb-4">
                      Key Takeaways
                    </h2>
                    <ul className="space-y-2">
                      {result.notes.summary.keyTakeaways.map((takeaway: string, index: number) => (
                        <li key={index} className="text-[#E5E7EB] flex items-start gap-2">
                          <span className="text-[#A6A8AD] mt-1">•</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {result.notes.summary?.actionItems && result.notes.summary.actionItems.length > 0 && (
                  <div className="bg-[#121315] border border-[#2A2C31] rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-[#F5F7FA] mb-4">
                      Action Items
                    </h2>
                    <ul className="space-y-2">
                      {result.notes.summary.actionItems.map((item: string, index: number) => (
                        <li key={index} className="text-[#E5E7EB] flex items-start gap-2">
                          <span className="text-[#A6A8AD] mt-1">📝</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Structured Notes */}
                {result.notes.notes && result.notes.notes.length > 0 && (
                  <div className="bg-[#121315] border border-[#2A2C31] rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-[#F5F7FA] mb-4">
                      Structured Notes
                    </h2>
                    <div className="space-y-4">
                      {result.notes.notes.map((note: any, index: number) => (
                        <div key={index}>
                          <h3 className="text-lg font-medium text-[#F5F7FA] mb-2">
                            {note.heading}
                          </h3>
                          <ul className="space-y-1">
                            {note.bullets.map((bullet: string, bulletIndex: number) => (
                              <li key={bulletIndex} className="text-[#E5E7EB] flex items-start gap-2">
                                <span className="text-[#A6A8AD] mt-1">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tables */}
                {result.notes.tables && result.notes.tables.length > 0 && (
                  <div className="bg-[#121315] border border-[#2A2C31] rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-[#F5F7FA] mb-4">
                      Tables
                    </h2>
                    <div className="space-y-4">
                      {result.notes.tables.map((table: any, index: number) => (
                        <div key={index}>
                          <h3 className="text-lg font-medium text-[#F5F7FA] mb-2">
                            {table.title}
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b border-[#2A2C31]">
                                  {table.columns.map((column: string, colIndex: number) => (
                                    <th key={colIndex} className="text-left p-2 text-[#A6A8AD] font-medium">
                                      {column}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows.map((row: string[], rowIndex: number) => (
                                  <tr key={rowIndex} className="border-b border-[#2A2C31]/50">
                                    {row.map((cell: string, cellIndex: number) => (
                                      <td key={cellIndex} className="p-2 text-[#E5E7EB]">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Raw JSON */}
            <details className="bg-[#121315] border border-[#2A2C31] rounded-xl p-6">
              <summary className="text-lg font-semibold text-[#F5F7FA] cursor-pointer mb-4">
                Raw Response Data
              </summary>
              <pre className="text-sm text-[#A6A8AD] overflow-auto bg-[#0B0B0C] p-4 rounded-lg">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
