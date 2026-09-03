// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TerraGuard - Infrastructure-as-Code Security Platform",
  description: "Deterministic Terraform security scanner for AWS misconfigurations, severity-based risk prioritization, and CI/CD security enforcement.",
  keywords: ["Terraform", "Security", "IaC", "DevSecOps", "AWS", "Cloud Security"],
  authors: [{ name: "Yash Hirve" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-gray-100 flex flex-col antialiased`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}