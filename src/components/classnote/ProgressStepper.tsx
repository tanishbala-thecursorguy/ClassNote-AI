import { Check, Loader2 } from "lucide-react";

interface Step {
  label: string;
  status: "pending" | "active" | "complete";
}

interface ProgressStepperProps {
  steps: Step[];
}

export function ProgressStepper({ steps }: ProgressStepperProps) {
  return (
    <div className="flex flex-col gap-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                step.status === "complete"
                  ? "border-[#F5F7FA] bg-[#F5F7FA]"
                  : step.status === "active"
                  ? "border-[#F5F7FA] bg-transparent"
                  : "border-[#2A2C31] bg-transparent"
              }`}
            >
              {step.status === "complete" ? (
                <Check className="w-5 h-5 text-[#0B0B0C]" />
              ) : step.status === "active" ? (
                <Loader2 className="w-5 h-5 text-[#F5F7FA] animate-spin" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#2A2C31]" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-6 ${
                  step.status === "complete" ? "bg-[#F5F7FA]" : "bg-[#2A2C31]"
                }`}
              />
            )}
          </div>
          <div>
            <p
              className={`${
                step.status === "pending" ? "text-[#A6A8AD]" : "text-[#F5F7FA]"
              }`}
            >
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
