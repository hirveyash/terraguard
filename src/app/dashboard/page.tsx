// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { scanTerraformCode, ScanOutput } from "@/lib/scanner";
import Editor from "@/components/MonacoEditor";
import ResultsDashboard from "@/components/ResultsDashboard";
import { Shield, Upload, RotateCcw, AlertCircle } from "lucide-react";

const DEFAULT_CODE = `# Terraform Infrastructure as Code
# Paste your Terraform configuration here and click "Scan Infrastructure"

resource "aws_s3_bucket" "example" {
  bucket = "my-example-bucket"
  acl    = "private"
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
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
}
`;

type ScanState = "idle" | "preparing" | "scanning" | "processing" | "complete" | "error";

export default function DashboardPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [scanResult, setScanResult] = useState<ScanOutput | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!code.trim()) {
      setError("Please enter Terraform code to scan");
      return;
    }

    setError(null);
    setScanState("preparing");
    setScanResult(null);

    // Truthful scan progression - no artificial delays
    try {
      setScanState("scanning");
      
      // Execute scanner synchronously but allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const result = scanTerraformCode(code, "main.tf");
      
      setScanState("processing");
      setScanResult(result);
      setScanState("complete");
    } catch (err) {
      console.error("Scan failed:", err);
      setError(err instanceof Error ? err.message : "Scan failed");
      setScanState("error");
    }
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    setScanResult(null);
    setScanState("idle");
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Infrastructure Security Scanner
        </h1>
        <p className="text-gray-400">
          Scan Terraform configurations for security misconfigurations and compliance violations
        </p>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Terraform Configuration
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors flex items-center gap-2"
                aria-label="Reset editor"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                onClick={handleScan}
                disabled={scanState === "preparing" || scanState === "scanning" || scanState === "processing"}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
              >
                {scanState === "preparing" || scanState === "scanning" || scanState === "processing" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {scanState === "preparing" && "Preparing..."}
                    {scanState === "scanning" && "Scanning..."}
                    {scanState === "processing" && "Processing..."}
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Scan Infrastructure
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[500px] border border-gray-700 rounded-lg overflow-hidden bg-gray-900 relative">
            <Editor
              height="100%"
              language="hcl"
              value={code}
              onChange={(value) => {
                setCode(value || "");
                setError(null);
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="mt-4 p-4 bg-red-950/50 border border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-200">Scan Error</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Security Findings
            </h2>
            {scanResult && !("error" in scanResult) && (
              <div className="flex items-center gap-3 text-sm">
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

          <div className="flex-1 min-h-[500px] border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
            {scanState === "idle" && (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center p-8">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-gray-400 mb-2">
                    Ready to Scan
                  </p>
                  <p className="text-sm text-gray-500 max-w-md">
                    Paste your Terraform configuration in the editor and click "Scan Infrastructure" to analyze for security misconfigurations.
                  </p>
                </div>
              </div>
            )}

            {(scanState === "preparing" || scanState === "scanning" || scanState === "processing") && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-300 mb-2">
                    {scanState === "preparing" && "Preparing scan..."}
                    {scanState === "scanning" && "Scanning Terraform..."}
                    {scanState === "processing" && "Processing findings..."}
                  </p>
                  <p className="text-sm text-gray-500">
                    Analyzing infrastructure for security issues
                  </p>
                </div>
              </div>
            )}

            {scanState === "error" && (
              <div className="h-full flex items-center justify-center text-red-400">
                <div className="text-center p-8">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-red-300 mb-2">
                    Scan Failed
                  </p>
                  <p className="text-sm text-red-400 max-w-md">
                    {error || "An error occurred while scanning. Please try again."}
                  </p>
                </div>
              </div>
            )}

            {scanState === "complete" && scanResult && (
              <ResultsDashboard result={scanResult} sourceCode={code} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}