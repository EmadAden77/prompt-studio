# Selfie Prompt Studio

A mobile-first Arabic web app that builds structured English prompts for generating highly realistic selfie images in ChatGPT from a user-provided reference image.

## Scope

- Selfie prompts only
- Reference-image identity lock
- Custom or preset locations
- Multiple selfie camera angles
- Multiple poses and expressions
- Lighting and front-camera presets
- Mandatory realism rules in every generated prompt
- Copy-to-clipboard output
- No API key required
- Villa Scene Engine v46
- Connected Villa Reference Registry v47

## Villa visual references

The repository now includes a connected villa reference contact sheet (`villa-reference-board.jpg`), a primary hall reference (`villa-hall-a.png`), and `villa-reference-manifest.json` describing the mapped villa scenes and camera angles. The app loads `villa-reference-registry-v47.js` after the villa engine.

## Run locally

Open `index.html` in a browser, or serve the folder with any static HTTP server.

Example:

```bash
npx serve .
```

## Privacy

The selected identity reference image is previewed locally in the browser. This version does not upload or transmit that identity image anywhere.
