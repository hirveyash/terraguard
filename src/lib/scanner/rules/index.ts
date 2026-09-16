// src/lib/scanner/rules/index.ts
import type { Rule } from './types';

// IAM Rules
import { tgIam001 } from './iam/tg-iam-001';
import { tgIam002 } from './iam/tg-iam-002';
import { tgIam003 } from './iam/tg-iam-003';
import { tgIam004 } from './iam/tg-iam-004';

// S3 Rules
import { tgS3001 } from './s3/tg-s3-001';
import { tgS3002 } from './s3/tg-s3-002';
import { tgS3003 } from './s3/tg-s3-003';
import { tgS3004 } from './s3/tg-s3-004';

// EBS Rules
import { tgEbs001 } from './ebs/tg-ebs-001';

// RDS Rules
import { tgRds001 } from './rds/tg-rds-001';
import { tgRds002 } from './rds/tg-rds-002';
import { tgRds003 } from './rds/tg-rds-003';

// KMS Rules
import { tgKms001 } from './kms/tg-kms-001';

// Network Rules
import { tgNet001 } from './network/tg-net-001';
import { tgNet002 } from './network/tg-net-002';
import { tgNet003 } from './network/tg-net-003';
import { tgNet004 } from './network/tg-net-004';
import { tgNacl001 } from './network/tg-nacl-001';

// Logging Rules
import { tgLog001 } from './logging/tg-log-001';
import { tgLog002 } from './logging/tg-log-002';

// Secrets Rules
import { tgSec001 } from './secrets/tg-sec-001';
import { tgSec002 } from './secrets/tg-sec-002';

// Compute Rules
import { tgEc2001 } from './compute/tg-ec2-001';
import { tgLam001 } from './compute/tg-lam-001';

// Encryption Rules
import { tgEnc001 } from './encryption/tg-enc-001';
import { tgEnc002 } from './encryption/tg-enc-002';
import { tgElc001 } from './encryption/tg-elc-001';

// Database Rules
import { tgDb001 } from './database/tg-db-001';
import { tgDb002 } from './database/tg-db-002';

// Export all rules
export const allRules: Rule[] = [
  tgIam001, tgIam002, tgIam003, tgIam004,
  tgS3001, tgS3002, tgS3003, tgS3004,
  tgEbs001,
  tgRds001, tgRds002, tgRds003,
  tgKms001,
  tgNet001, tgNet002, tgNet003, tgNet004, tgNacl001,
  tgLog001, tgLog002,
  tgSec001, tgSec002,
  tgEc2001, tgLam001,
  tgEnc001, tgEnc002, tgElc001,
  tgDb001, tgDb002,
];

export type { Rule };