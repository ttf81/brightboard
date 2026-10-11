# Brightboard

A Vue brainstorming form with expandable idea fields. Submissions are stored in `test.json` by a small Express API.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on port `3001`.

## Production

```bash
npm run build
npm start
```

The production app is served at `http://localhost:3001`.

## GitHub Pages

Pushes to `main` deploy the static client through GitHub Actions. Because GitHub Pages cannot run the Express server or write files, the hosted version stores submissions in the visitor's browser using `localStorage`. The local version continues to persist submissions in `test.json`.
