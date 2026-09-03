// src/components/MonacoEditor.tsx
"use client";

import dynamic from 'next/dynamic';
import { EditorProps } from '@monaco-editor/react';
import { useState, useEffect } from 'react';

// Dynamically import Monaco with SSR disabled to prevent server-side hanging
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => null, // We handle loading state manually
});

interface MonacoEditorProps extends EditorProps {
  onError?: (error: Error) => void;
}

export default function Editor(props: MonacoEditorProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [fallbackValue, setFallbackValue] = useState(props.value || '');

  useEffect(() => {
    // Fallback timeout: if Monaco doesn't load in 8 seconds, show a textarea
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.warn('Monaco Editor load timeout. Switching to fallback textarea.');
        setHasError(true);
        props.onError?.(new Error('Monaco Editor load timeout'));
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [isLoaded, props.onError]);

  const handleEditorMount = () => {
    setIsLoaded(true);
  };

  // Fallback textarea if Monaco fails to load (e.g., CDN blocked)
  if (hasError) {
    return (
      <textarea
        value={fallbackValue}
        onChange={(e) => {
          setFallbackValue(e.target.value);
          props.onChange?.(e.target.value);
        }}
        className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
        placeholder="# Paste your Terraform code here..."
        spellCheck={false}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading editor...</p>
            <p className="text-xs text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}
      <MonacoEditor
        {...props}
        onMount={handleEditorMount}
        options={{
          ...props.options,
          automaticLayout: true,
        }}
      />
    </div>
  );
}