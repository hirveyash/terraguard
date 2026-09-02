"use client";

import { useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ResultsDashboard from "@/components/ResultsDashboard";
import { scanTerraformCode, type ScanResult, type ScanOutput } from "@/lib/scanner/index";import { Search, Code, AlertCircle } from "lucide-react";
import { MAX_INPUT_SIZE_BYTES } from "@/lib/security";

const defaultCode = `# Example Terraform Configuration
# Try modifying this code and clicking "Scan"

resource "aws_security_group" "web_server" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # VULNERABILITY: Open to the world!
  }
}

resource "aws_s3_bucket" "sensitive_data" {
  bucket = "my-company-secrets"
  acl    = "public-read" # VULNERABILITY: Public access!
}
`;

export default function Home() {
  const [code, setCode] = useState(defaultCode);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleCodeChange = (value: string) => {
    if (value.length <= MAX_INPUT_SIZE_BYTES) {
      setCode(value);
      setScanError(null);
    } else {
      setScanError(`Code size exceeds maximum allowed limit of ${MAX_INPUT_SIZE_BYTES / 1024}KB.`);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setScanError(null);
    
    setTimeout(() => {
      try {
        const output = scanTerraformCode(code) as ScanOutput;
        
        if ('error' in output) {
          setScanError(output.error);
          setScanResult(null);
        } else {
          setScanResult(output);
          setScanError(null);
        }
      } catch (err) {
        setScanError('An unexpected error occurred during scanning.');
        setScanResult(null);
      } finally {
        setIsScanning(false);
      }
    }, 50);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-800 p-4 flex justify-between items-center bg-gray-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Search size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            TerraGuard <span className="text-blue-400 text-sm font-normal">IaC Scanner</span>
          </h1>
        </div>
        <a 
          href="https://github.com/hirveyash/terraguard" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Code size={18} /> View Source
        </a>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Left Side: Editor & Controls */}
        <div className="flex-1 flex flex-col gap-4 min-h-[400px] lg:min-h-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-300">Infrastructure Code (Terraform)</h2>
            <button
              onClick={handleScan}
              disabled={isScanning || !!scanError}
              className={`font-semibold py-2 px-6 rounded-lg shadow-lg transition-all flex items-center gap-2 ${
                isScanning || !!scanError 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              <Search size={18} /> {isScanning ? 'Scanning...' : 'Run Security Scan'}
            </button>
          </div>
          
          {scanError && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle size={16} />
              {scanError}
            </div>
          )}

          <div className="flex-1">
            <CodeEditor value={code} onChange={handleCodeChange} />
          </div>
        </div>

        {/* Right Side: Dashboard */}
        <div className="flex-1 min-h-[400px] lg:min-h-0">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Security Findings</h2>
          <div className="h-[calc(100%-2rem)]">
            <ResultsDashboard result={scanResult} sourceCode={code} />
          </div>
        </div>
      </div>
    </main>
  );
}