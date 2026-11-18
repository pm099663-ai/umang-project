# LoanPredict AI

[Deploy this app to Render](https://render.com/deploy?repo=https://github.com/pm099663-ai/umang-project)

Educational loan eligibility demo with a Node.js backend.

## Run locally
Use Node.js 18 or newer, then run `npm start` in this folder and open http://127.0.0.1:3000.

The API validates submissions at `POST /api/predict`. `GET /api/health` reports server status. Demo submissions are written to `data/applications.jsonl`; that file is excluded from Git and is never served over HTTP.

## Deploy on Render
This repository includes a Render Blueprint in `render.yaml`. In Render, create a new Blueprint and select this repository. The included service uses the free instance type. Free service storage is temporary: saved applications can be lost when the instance restarts or is redeployed. Use an external database or a paid persistent disk before relying on stored submissions.

## Prediction note
No trained model or dataset was supplied. The current response is an educational heuristic based on credit history and estimated monthly payment relative to household income. It is not a bank decision, a credit assessment, or a guarantee of approval. Do not enter real financial information into this demo.