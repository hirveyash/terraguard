# Testing Strategy

TerraGuard employs a comprehensive testing pyramid to ensure reliability, security, and performance.

## Test Categories
1. **Unit Tests (`src/tests/rules/`)**: Validate individual rule logic against specific HCL snippets.
2. **Integration Tests (`src/tests/scanner.security.test.ts`, `src/tests/cli.test.ts`)**: Verify the end-to-end flow from input parsing to JSON/SARIF output generation.
3. **Security & Fuzzing Tests (`src/tests/security-*.ts`, `src/tests/fuzzing.test.ts`)**: Subject the parser and scanner to hostile inputs (binary data, ReDoS patterns, 100+ levels of nesting, huge files).
4. **Performance Tests (`src/tests/performance.test.ts`)**: Benchmark scan times and memory usage at 1KB, 10KB, 100KB, and 1MB to ensure linear scalability and bounded resource consumption.
5. **Regression Tests (`src/tests/regression.test.ts`)**: Lock in fixes for previously discovered bugs (e.g., boolean parsing edge cases) to prevent recurrence.

## Execution
- **Local Development**: `npm run test` (Vitest watch mode).
- **CI Pipeline**: `npm run test:run` (Headless, fails on any test failure).
- **Coverage Goal**: Meaningful coverage of critical paths (>80%), avoiding "gaming" the metric with trivial assertions.