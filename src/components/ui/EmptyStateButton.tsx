import { Button } from "@/components/ui/button";
import React from "react";

interface EmptyStateButtonProps {
  label: string;
  onClick: () => void;
  color?: "blue" | "green";
  description?: string;
}

const colorMap = {
  blue: "bg-gradient-to-r from-blue-500 to-blue-700",
  green: "bg-gradient-to-r from-green-500 to-green-700",
};

export const EmptyStateButton: React.FC<EmptyStateButtonProps> = ({ label, onClick, color = "blue", description }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px]">
    <Button
      onClick={onClick}
      className={`mb-4 px-8 py-4 text-lg font-bold text-white shadow-lg hover:scale-105 transition-transform rounded-full animate-bounce ${colorMap[color]}`}
    >
      <span className="inline-flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        {label}
      </span>
    </Button>
    {description && <p className="text-gray-400 text-sm">{description}</p>}
  </div>
);
