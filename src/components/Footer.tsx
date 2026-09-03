// src/components/Footer.tsx
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">TerraGuard</p>
              <p className="text-xs text-gray-400">Infrastructure-as-Code Security Platform</p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">
              Developed by <span className="text-white font-medium">Yash Hirve</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Terraform Security • Cloud Security • DevSecOps
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} TerraGuard. Deterministic Infrastructure Security Scanning.
          </p>
        </div>
      </div>
    </footer>
  );
}