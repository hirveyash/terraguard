// src/app/about/page.tsx
import { Shield, Code, Lock, GitBranch } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl mb-4">
          <Shield className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">TerraGuard</h1>
        <p className="text-xl text-gray-400">Infrastructure-as-Code Security Platform</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">What is TerraGuard?</h2>
          <p className="text-gray-300 leading-relaxed">
            TerraGuard is a deterministic Terraform Infrastructure-as-Code security scanner designed for 
            DevSecOps teams. It performs static analysis on Terraform configurations to detect AWS 
            misconfigurations, compliance violations, and security vulnerabilities before deployment.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <Code className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">22 Security Rules</h3>
              <p className="text-sm text-gray-400">
                Comprehensive coverage of IAM, S3, networking, databases, encryption, and more with zero false positives.
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <Lock className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Deterministic Analysis</h3>
              <p className="text-sm text-gray-400">
                Same input always produces same output. No AI, no randomness, no cloud API dependencies.
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <GitBranch className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">CI/CD Integration</h3>
              <p className="text-sm text-gray-400">
                GitHub Actions workflow with SARIF output for GitHub Code Scanning and configurable failure thresholds.
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <Shield className="h-8 w-8 text-yellow-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Risk Scoring</h3>
              <p className="text-sm text-gray-400">
                Severity-based risk scoring (0-100) with framework mappings to CIS, NIST, and MITRE ATT&CK.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Developed by</h2>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <p className="text-lg text-white font-medium">Yash Hirve</p>
            <p className="text-sm text-gray-400 mt-1">
              Cloud Security • DevSecOps • Infrastructure Security
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Technology Stack</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>Frontend:</strong> Next.js 16, React, TypeScript, Tailwind CSS</li>
            <li>• <strong>Editor:</strong> Monaco Editor (VS Code's editor)</li>
            <li>• <strong>Scanner:</strong> Custom HCL parser with 22 security rules</li>
            <li>• <strong>Testing:</strong> Vitest with 230+ tests</li>
            <li>• <strong>Deployment:</strong> Vercel</li>
          </ul>
        </section>
      </div>
    </div>
  );
}