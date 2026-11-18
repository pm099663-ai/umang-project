# LoanPredict AI

Simple educational loan approval/rejection predictor.

Live demo: https://umang-project.vercel.app/

## Run locally
Node.js 18+: run `npm start`, then open http://127.0.0.1:3000.

## Prediction rule
The demo estimates a monthly EMI, adds existing EMI, and compares the total with 40% of combined household monthly income. It predicts Approved only when credit history is Good and the EMI ratio is within that demo limit. It does not store values or contact a lender.

This is a rule-based classroom demo, not a trained machine-learning model, real bank decision, loan offer, or guarantee. Use a suitable labeled dataset to train and validate a real model.
