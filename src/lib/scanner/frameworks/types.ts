// src/lib/scanner/frameworks/types.ts

export interface FrameworkMapping {
  framework: string;
  version: string;
  control: string;
  reason: string;
}

export type FrameworkMappings = FrameworkMapping[];

export interface FrameworkRegistry {
  name: string;
  version: string;
  description: string;
  url: string;
}

export const FRAMEWORKS: Record<string, FrameworkRegistry> = {
  'CIS AWS Foundations Benchmark': {
    name: 'CIS AWS Foundations Benchmark',
    version: '1.5.0',
    description: 'Center for Internet Security AWS Foundations Benchmark',
    url: 'https://www.cisecurity.org/benchmark/aws'
  },
  'NIST SP 800-53': {
    name: 'NIST SP 800-53',
    version: 'Rev. 5',
    description: 'Security and Privacy Controls for Information Systems and Organizations',
    url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final'
  },
  'MITRE ATT&CK': {
    name: 'MITRE ATT&CK',
    version: 'v14',
    description: 'Adversarial Tactics, Techniques, and Common Knowledge',
    url: 'https://attack.mitre.org/'
  }
};