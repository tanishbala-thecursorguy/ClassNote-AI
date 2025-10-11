import { ArrowLeft, Mic, Wifi, Lock, HardDrive } from "lucide-react";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";

interface SettingsScreenProps {
  onBack: () => void;
  onTestRecorder?: () => void;
}

export function SettingsScreen({ onBack, onTestRecorder }: SettingsScreenProps) {
  const [audioQuality, setAudioQuality] = useState("high");
  const [autoUpload, setAutoUpload] = useState(true);
  const [deleteAfterExport, setDeleteAfterExport] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Header */}
      <div className="bg-[#121315] border-b border-[#2A2C31] px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#2A2C31] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#F5F7FA]" />
          </button>
          <h1 className="text-[#F5F7FA]">Settings</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Audio Settings */}
        <div>
          <h3 className="text-[#F5F7FA] mb-4">Audio</h3>
          <div className="bg-[#121315] border border-[#2A2C31] rounded-2xl divide-y divide-[#2A2C31]">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mic className="w-5 h-5 text-[#A6A8AD]" />
                <label className="text-[#F5F7FA]">Recording Quality</label>
              </div>
              <Select value={audioQuality} onValueChange={setAudioQuality}>
                <SelectTrigger className="bg-[#1C1D20] border-[#2A2C31] text-[#F5F7FA] mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1D20] border-[#2A2C31]">
                  <SelectItem value="low" className="text-[#F5F7FA]">Low (saves space)</SelectItem>
                  <SelectItem value="medium" className="text-[#F5F7FA]">Medium</SelectItem>
                  <SelectItem value="high" className="text-[#F5F7FA]">High (best quality)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[#A6A8AD] text-sm mt-2">
                Higher quality uses more storage
              </p>
            </div>
          </div>
        </div>

        {/* Upload Settings */}
        <div>
          <h3 className="text-[#F5F7FA] mb-4">Upload</h3>
          <div className="bg-[#121315] border border-[#2A2C31] rounded-2xl divide-y divide-[#2A2C31]">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-[#A6A8AD]" />
                <div>
                  <label className="text-[#F5F7FA] block">Auto-upload on Wi-Fi</label>
                  <p className="text-[#A6A8AD] text-sm">Save mobile data</p>
                </div>
              </div>
              <Switch
                checked={autoUpload}
                onCheckedChange={setAutoUpload}
                className="data-[state=checked]:bg-[#F5F7FA]"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h3 className="text-[#F5F7FA] mb-4">Privacy</h3>
          <div className="bg-[#121315] border border-[#2A2C31] rounded-2xl divide-y divide-[#2A2C31]">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#A6A8AD]" />
                <div>
                  <label className="text-[#F5F7FA] block">Delete after export</label>
                  <p className="text-[#A6A8AD] text-sm">Remove audio after PDF</p>
                </div>
              </div>
              <Switch
                checked={deleteAfterExport}
                onCheckedChange={setDeleteAfterExport}
                className="data-[state=checked]:bg-[#F5F7FA]"
              />
            </div>
          </div>
        </div>

        {/* Storage */}
        <div>
          <h3 className="text-[#F5F7FA] mb-4">Storage</h3>
          <div className="bg-[#121315] border border-[#2A2C31] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <HardDrive className="w-5 h-5 text-[#A6A8AD]" />
              <label className="text-[#F5F7FA]">Storage Usage</label>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#E5E7EB]">Recordings</span>
                <span className="text-[#A6A8AD]">1.2 GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#E5E7EB]">Notes & PDFs</span>
                <span className="text-[#A6A8AD]">156 MB</span>
              </div>
              <div className="h-2 bg-[#2A2C31] rounded-full overflow-hidden mt-3">
                <div className="h-full bg-[#F5F7FA] w-[45%]" />
              </div>
              <p className="text-[#A6A8AD] text-sm text-center mt-2">
                1.36 GB of 3 GB used
              </p>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className="text-[#F5F7FA] mb-4">About</h3>
          <div className="bg-[#121315] border border-[#2A2C31] rounded-2xl divide-y divide-[#2A2C31]">
            <button className="p-4 w-full text-left hover:bg-[#1C1D20] transition-colors">
              <span className="text-[#F5F7FA]">Version</span>
              <p className="text-[#A6A8AD] text-sm">1.0.0</p>
            </button>
            <button className="p-4 w-full text-left hover:bg-[#1C1D20] transition-colors">
              <span className="text-[#F5F7FA]">Privacy Policy</span>
            </button>
            <button className="p-4 w-full text-left hover:bg-[#1C1D20] transition-colors">
              <span className="text-[#F5F7FA]">Terms of Service</span>
            </button>
          </div>
        </div>

        {/* Development */}
        <div>
          <h3 className="text-[#F5F7FA] mb-4">Development</h3>
          <div className="bg-[#121315] border border-[#2A2C31] rounded-2xl">
            {onTestRecorder && (
              <button 
                onClick={onTestRecorder}
                className="p-4 w-full text-left hover:bg-[#1C1D20] transition-colors border-b border-[#2A2C31] last:border-b-0"
              >
                <span className="text-[#F5F7FA]">Test QuickRecorder</span>
                <p className="text-[#A6A8AD] text-sm mt-1">
                  Test the Supabase-integrated recorder
                </p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
