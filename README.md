# GridWise – Edge-AI EV Charging Audit

GridWise is a browser-based EV charging audit dashboard enhanced with a lightweight local Edge-AI anomaly detector and secure load-optimization recommendations.

## Features
- CSV upload and sample data
- Existing EV charging audit dashboard
- Hybrid rule + local Edge-AI anomaly scoring
- Local inference in the browser (no cloud AI API)
- Explainability and security views
- Smart load optimization recommendations
- PDF audit export

## Edge-AI approach
The application builds a local baseline from SoC, temperature, grid load, and charging rate. It calculates a weighted deviation score for each record and combines it with the existing safety-rule score. This keeps inference simple, fast, and entirely client-side.

## Smart load optimization
The optimizer recommends lower charging rates when grid load is high, battery temperature is elevated, or SoC is already high. It is a decision-support simulation and does not control physical EV chargers.

## Run locally
```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

## Production build
```bash
npm run build
npm run preview
```

## Free deployment
Push the project to GitHub and import the repository into Vercel. Use:
- Build command: `npm run build`
- Output directory: `dist`

Updated GridWise project documentation
