// src/components/SecurityScore.tsx
"use client";

import { useEffect, useState } from "react";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";

interface SecurityScoreProps {
  score: number;
}

export default function SecurityScore({ score }: SecurityScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Animate score from 0 to actual value
    setIsAnimating(true);
    const duration = 1000;
    const steps = 20;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
        setIsAnimating(false);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { text: "Strong", color: "text-green-400" };
    if (score >= 60) return { text: "Moderate", color: "text-yellow-400" };
    if (score >= 40) return { text: "Weak", color: "text-orange-400" };
    return { text: "Critical", color: "text-red-400" };
  };

  const label = getScoreLabel(score);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">Security Posture Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${getScoreColor(score)} ${isAnimating ? "transition-all" : ""}`}>
              {animatedScore}
            </span>
            <span className="text-2xl text-gray-500">/100</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {score >= 80 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${label.color}`}>
              {label.text}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Deterministic score based on severity-weighted penalties
          </p>
        </div>
        <div className="hidden sm:block">
          <Shield className={`h-20 w-20 ${getScoreColor(score)} opacity-20`} />
        </div>
      </div>
    </div>
  );
}