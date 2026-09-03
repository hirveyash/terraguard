// src/components/MonacoEditor.tsx
"use client";

import dynamic from 'next/dynamic';
import { EditorProps } from '@monaco-editor/react';

// Dynamically import Monaco with SSR disabled
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="text-sm">Loading editor...</div>
    </div>
  ),
});

export default function Editor(props: EditorProps) {
  return <MonacoEditor {...props} />;
}