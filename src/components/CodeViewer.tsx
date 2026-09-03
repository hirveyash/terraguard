// src/components/CodeViewer.tsx
"use client";

import { FileCode } from "lucide-react";

interface CodeViewerProps {
  code: string;
  highlightLine?: number;
  fileName: string;
}

export default function CodeViewer({ code, highlightLine, fileName }: CodeViewerProps) {
  const lines = code.split("\n");

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border-b border-gray-700">
        <FileCode className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-mono text-gray-300">{fileName}</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isHighlighted = highlightLine === lineNumber;
            
            return (
              <div
                key={index}
                className={`flex ${isHighlighted ? "bg-yellow-900/30 -mx-4 px-4" : ""}`}
              >
                <span className={`select-none w-12 text-right pr-4 ${isHighlighted ? "text-yellow-400" : "text-gray-600"}`}>
                  {lineNumber}
                </span>
                <span className={`${isHighlighted ? "text-yellow-100" : "text-gray-300"}`}>
                  {line}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}