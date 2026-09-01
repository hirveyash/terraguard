"use client";

import { useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ResultsDashboard from "@/components/ResultsDashboard";
import { scanTerraformCode, ScanResult } from "@/lib/scanner";
import { Search, Code } from "lucide-react";

// Sample vulnerable Terraform code to load by default
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

  const handleScan = () => {
    const result = scanTerraformCode(code);
    setScanResult(result);
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
          href="https://github.com" 
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Search size={18} /> Run Security Scan
            </button>
          </div>
          <div className="flex-1">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        {/* Right Side: Dashboard */}
        <div className="flex-1 min-h-[400px] lg:min-h-0">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Security Findings</h2>
          <div className="h-[calc(100%-2rem)]">
            <ResultsDashboard result={scanResult} />
          </div>
        </div>
      </div>
    </main>
  );
}