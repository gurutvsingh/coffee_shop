# Contributing Guide

Thanks for contributing to Coffee Shop.

## Local Setup

1. Install dependencies:
   npm install
2. Start backend:
   npm start
3. Open frontend files in browser:
   - index.html
   - cart.html

## Branch and Commit Rules

1. Create feature branches from main.
2. Keep commits focused and small.
3. Use clear commit messages:
   - feat: add checkout validation
   - fix: handle empty cart state
   - docs: update API guide

## Code Style

- Keep JavaScript beginner-friendly and modular.
- Avoid inline event handlers.
- Use meaningful names and short comments for complex logic only.

## Pull Request Checklist

- App runs locally without errors.
- Backend APIs still work:
  - GET /orders
  - GET /bookings
  - POST /order
  - POST /booking
- UI remains responsive on mobile and desktop.
- No large generated folders committed (for example node_modules).
