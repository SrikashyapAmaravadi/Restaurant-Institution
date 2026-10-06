#!/bin/bash

# Quick deployment fix script for Vercel 500 errors and CI failure

echo "🔧 Applying production fixes..."

# Show changes
echo ""
echo "Files modified:"
echo "  ✅ server/src/config/db.js (Prisma singleton for Vercel)"
echo "  ✅ .github/workflows/ci.yml (DATABASE_URL for CI)"
echo ""

# Git operations
echo "📦 Staging changes..."
git add server/src/config/db.js
git add .github/workflows/ci.yml
git add VERCEL_500_ERROR_FIX.md
git add CI_FIX_INSTRUCTIONS.md

echo "💾 Committing..."
git commit -m "fix: Add Prisma singleton for Vercel + CI environment variables

- Fix Prisma connection exhaustion in Vercel serverless (singleton pattern)
- Add DATABASE_URL and DIRECT_URL to GitHub Actions CI
- Resolves 500 errors on all API endpoints
- Resolves P1012 Prisma validation error in CI

Fixes #9"

echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Fixes deployed!"
echo ""
echo "Next steps:"
echo "  1. Wait for CI to pass: https://github.com/$(git config remote.origin.url | sed 's/.*://;s/.git$//')/actions"
echo "  2. Vercel will auto-deploy"
echo "  3. Test: curl https://restaurant-institution.vercel.app/api/health"
echo ""
