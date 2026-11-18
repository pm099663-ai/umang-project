# LoanPredict AI

A step-by-step educational loan calculator demo.

## Live demo
https://umang-project.vercel.app/

## Run locally
Use Node.js 18 or newer, run `npm start`, then open http://127.0.0.1:3000.

## How it works
The calculator takes a requested amount, example interest rate, term, monthly income, and existing monthly EMIs. The backend applies a simple 35% monthly-income budgeting heuristic and returns illustrative repayment scenarios. It does not save submitted values, use a trained model, check credit, or contact lenders.

Vercel serves static assets from `public/` and the Node.js API at `POST /api/predict`. The Render Blueprint is also included for local project deployment.

## Important
This is not a credit decision, financial advice, lender offer, or guarantee of approval. Do not enter real financial or identity details. A real lender will use different criteria and make an independent assessment.
