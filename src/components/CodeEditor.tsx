// src/components/CodeEditor.tsx
"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  return (
    <div className="h-full w-full border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
      <Editor
        height="100%"
        defaultLanguage="ruby" 
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          fontFamily: "Fira Code, monospace",
        }}
      />
    </div>
  );
}