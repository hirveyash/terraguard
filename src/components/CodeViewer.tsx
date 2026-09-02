// src/components/CodeViewer.tsx
"use client";

import { getCodeContext } from "@/lib/ui/helpers";

interface CodeViewerProps {
  source: string;
  targetLine: number;
  fileName?: string;
}

export default function CodeViewer({ source, targetLine, fileName = "main.tf" }: CodeViewerProps) {
  const { lines } = getCodeContext(source, targetLine, 5);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
      <div className="px-3 py-2 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono">{fileName}</span>
        <span className="text-xs text-gray-500">Line {targetLine} highlighted</span>
      </div>
      <pre className="text-xs font-mono overflow-x-auto" role="region" aria-label="Terraform source code">
        <code>
          {lines.map(({ number, content }) => {
            const isTarget = number === targetLine;
            return (
              <div
                key={number}
                className={`flex ${isTarget ? 'bg-yellow-900/40 border-l-2 border-yellow-400' : 'border-l-2 border-transparent'}`}
              >
                <span
                  className={`inline-block w-12 text-right pr-3 select-none ${
                    isTarget ? 'text-yellow-300 font-bold' : 'text-gray-600'
                  }`}
                  aria-hidden="true"
                >
                  {number}
                </span>
                <span className={`flex-1 pl-2 pr-3 ${isTarget ? 'text-yellow-100' : 'text-gray-300'}`}>
                  {content || ' '}
                </span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}