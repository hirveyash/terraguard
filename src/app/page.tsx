// src/app/page.tsx
"use client";

import { useState } from "react";
import { scanTerraformCode, ScanOutput } from "@/lib/scanner";
import Editor from "@/components/MonacoEditor";
import ResultsDashboard from "@/components/ResultsDashboard";
import { Shield, AlertTriangle } from "lucide-react";

const DEFAULT_CODE = `# Terraform Infrastructure as Code
# Paste your Terraform configuration here

resource "aws_s3_bucket" "example" {
  bucket = "my-example-bucket"
  acl    = "private"
  
  tags = {
    Name        = "Example bucket"
    Environment = "Dev"
  }
}

resource "aws_security_group" "web" {
  name        = "web-security-group"
  description = "Allow HTTPS traffic"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
`;

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [scanResult, setScanResult] = useState<ScanOutput | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Small delay to allow UI to update
    setTimeout(() => {
      try {
        const result = scanTerraformCode(code, 'main.tf');
        setScanResult(result);
      } catch (error) {
        console.error('Scan failed:', error);
      }
      setIsScanning(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TerraGuard</h1>
              <p className="text-xs text-blue-400">IaC Scanner</p>
            </div>
          </div>
          <a
            href="https://github.com/hirveyash/terraguard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>&lt;&gt;</span> View Source
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Code Editor Panel */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-200">
                Infrastructure Code (Terraform)
              </h2>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Run Security Scan
                  </>
                )}
              </button>
            </div>
            <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden bg-gray-900 relative">
              <Editor
                height="100%"
                language="hcl"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-200">
                Security Findings
              </h2>
              {scanResult && !('error' in scanResult) && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">
                    {scanResult.findings.length} findings
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">
                    Score: {scanResult.riskScore}/100
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
              {isScanning ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm">Scanning...</p>
                  </div>
                </div>
              ) : !scanResult ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Shield size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Run a scan to see security findings...</p>
                  </div>
                </div>
              ) : 'error' in scanResult ? (
                <div className="h-full flex items-center justify-center text-red-400">
                  <div className="text-center max-w-md p-6">
                    <AlertTriangle size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-semibold mb-2">Scan Error</p>
                    <p className="text-xs text-gray-400">{scanResult.error}</p>
                  </div>
                </div>
              ) : (
                <ResultsDashboard result={scanResult} sourceCode={code} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}