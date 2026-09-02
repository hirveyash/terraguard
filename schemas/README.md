# TerraGuard Schemas

This directory contains formal JSON schemas for TerraGuard outputs.

## Schemas

### `terraguard-report.schema.json`

JSON Schema (Draft 2020-12) for the TerraGuard JSON report format.

- **Version:** 1.0.0
- **Stability:** The schema follows semantic versioning. Minor versions may add optional fields; major versions may change required fields.
- **URL:** `https://raw.githubusercontent.com/hirveyash/terraguard/main/schemas/terraguard-report.schema.json`

## Usage

### Validate a JSON report

Using Node.js with `ajv`:

```bash
npm install -D ajv ajv-formats