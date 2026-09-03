// src/app/rules/page.tsx
"use client";

import { useState } from "react";
import { Shield, AlertTriangle, AlertCircle, Info, Search } from "lucide-react";

// This would ideally come from the actual rules, but for now we'll show what we know exists
const RULE_CATEGORIES = [
  { id: "iam", name: "IAM", count: 4 },
  { id: "s3", name: "S3", count: 4 },
  { id: "network", name: "Network", count: 5 },
  { id: "database", name: "Database", count: 3 },
  { id: "encryption", name: "Encryption", count: 2 },
  { id: "compute", name: "Compute", count: 1 },
  { id: "logging", name: "Logging", count: 2 },
  { id: "secrets", name: "Secrets", count: 1 },
];

export default function RulesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Security Rules</h1>
        <p className="text-gray-400">
          Comprehensive security checks for Terraform infrastructure configurations
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">All Categories</option>
          {RULE_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Rule Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {RULE_CATEGORIES.map(category => (
          <div key={category.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
            <p className="text-sm text-gray-400">{category.count} rules</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-200 mb-2">About Security Rules</h3>
            <p className="text-sm text-blue-300/80 leading-relaxed">
              TerraGuard includes 22 deterministic security rules covering IAM, S3, networking, databases, 
              encryption, compute, logging, and secrets management. Each rule is designed to detect specific 
              AWS misconfigurations with zero false positives on secure configurations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}