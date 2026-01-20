# DMA Automation (Playwright)

This project contains end-to-end test automation using Playwright with Node.js and TypeScript.

## Prerequisites

- Node.js (v18 or later)
- npm
- Git

Check versions:
node -v
npm -v

## Setup

1. Clone the repository
   git clone <repository-url>
   cd automation-flow

2. Install dependencies
   npm install

3. Install Playwright browsers
   npx playwright install

## Run Tests

Run all tests:
npx playwright test

Run tests in headed mode:
npx playwright test --headed

Run a specific test file:
npx playwright test test/login.spec.ts

## Test Report

After execution, open the HTML report:
npx playwright show-report

## Project Structure

automation-flow/

- data/ (test data)
- pages/ (page objects)
- test/ (test cases)
- playwright.config.ts
- test-results/ (ignored)
- playwright-report/ (ignored)

## .gitignore

node_modules/
test-results/
playwright-report/
blob-report/
playwright/.cache/
playwright/.auth/

## Tech Stack

- Playwright
- TypeScript
- Node.js

## Author

DMA QA Automation Team
