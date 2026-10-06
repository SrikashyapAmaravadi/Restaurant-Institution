# CI/CD Pipeline Fix - Missing Environment Variables

## Problem
GitHub Actions CI pipeline failing with:
```
Error: Environment variable not found: DIRECT_URL
```

## Root Cause
Prisma schema requires both `DATABASE_URL` and `DIRECT_URL` environment variables, but GitHub Actions CI workflow didn't have them configured.

## Solution Applied ✅

Updated `.github/workflows/ci.yml` to include database connection strings in test environment:

```yaml
- name: Validate Prisma Schema
  env:
    DATABASE_URL: 'postgresql://postgres:password@localhost:5432/test_db'
    DIRECT_URL: 'postgresql://postgres:password@localhost:5432/test_db'
  run: npx prisma validate --schema=prisma/schema.prisma

- name: Run Backend Integration & Security Tests
  env:
    DATABASE_URL: 'postgresql://postgres:password@localhost:5432/test_db'
    DIRECT_URL: 'postgresql://postgres:password@localhost:5432/test_db'
    JWT_SECRET: 'dine_bennett_super_secret_jwt_key_2026_ci_testing_32chars'
    OTP_PEPPER: 'dine_bennett_super_secret_otp_pepper_2026_ci_testing'
  run: npm --prefix server test
```

## What This Does
- Provides mock PostgreSQL connection strings for CI validation
- These are dummy values (not real database) but satisfy Prisma schema validation
- Actual database connection is mocked in unit tests

## Deploy the Fix

```bash
git add .github/workflows/ci.yml
git commit -m "fix: Add DATABASE_URL and DIRECT_URL to CI environment"
git push origin main
```

## Verify CI Passes

1. Go to: https://github.com/SrikashyapAmaravadi/Restaurant-Institution/actions
2. Wait for workflow to complete
3. All checks should pass ✅

## Optional: Add Real PostgreSQL Service to CI

If you need actual database for integration tests, add this to `.github/workflows/ci.yml`:

```yaml
jobs:
  build-and-test:
    name: Build, Lint & Automated Testing
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      # ... existing steps ...
      
      - name: Run Backend Integration & Security Tests
        env:
          DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test_db'
          DIRECT_URL: 'postgresql://postgres:postgres@localhost:5432/test_db'
          JWT_SECRET: 'dine_bennett_super_secret_jwt_key_2026_ci_testing_32chars'
          OTP_PEPPER: 'dine_bennett_super_secret_otp_pepper_2026_ci_testing'
        run: |
          npx prisma migrate deploy
          npm --prefix server test
```

This will:
- Spin up real PostgreSQL 16 in CI
- Run actual migrations
- Execute tests against real database

---

**Status:** ✅ Fix applied - commit and push to resolve CI failure
