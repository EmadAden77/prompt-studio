# AI Selfie Prompt Studio

Production-grade, Arabic RTL prompt builder for ChatGPT Image Generation. It combines a strict identity reference (IMAGE A), a room reference (IMAGE B), pose physics, camera geometry, lighting, and room-continuity policies into one copy-paste-ready English prompt.

The app **does not generate images** and never uploads selected images to a server. Image previews and settings run entirely in the browser.

## Core principles

- IMAGE A controls identity only.
- IMAGE B controls the room only.
- Lower-number authority wins when constraints conflict.
- Scene selection first enforces pose, direction, and required features; only then does it score angle, distance, and defaults.
- EDIT mode preserves the reference photograph outside the subject/contact zone.
- GENERATE mode allows a reachable new view of the same known 3D room.
- Front and rear cameras are never mixed, and a rear-camera photograph is never described as a selfie.
- Realism comes from light, optics, anatomy, gravity, pressure, friction, and normal phone processing.

## Features

- Smart and manual room-reference modes
- Strict scene matching with confidence and reasons
- 15 physically described poses, including deterministic side-lying arm rules
- Xiaomi 15 Ultra front/rear camera separation and compatible lens selection
- Source-aware lighting validation
- Drag-and-drop IMAGE A and IMAGE B previews with local-only processing
- Strict conflict detection with safe auto-fixes
- Live English prompt generation and Arabic selection summary
- Reliable clipboard fallback and TXT export
- Responsive premium UI, dark/light theme, local setting persistence, keyboard shortcut
- No backend, dependencies, bundler, or build step

## Project structure

```text
prompt-studio/
├── index.html                       # Semantic RTL application shell
├── README.md                        # Setup, usage, architecture, deployment
├── .gitignore
├── .nojekyll                        # GitHub Pages compatibility
├── assets/
│   ├── favicon.svg
│   └── scene-placeholder.svg
├── css/
│   ├── tokens.css                   # Theme and design tokens
│   ├── main.css                     # Base, shell, layout
│   ├── components.css               # Controls, uploads, prompt, dialogs
│   └── responsive.css               # Tablet and mobile behavior
├── scenes/
│   └── README.md                    # Required scene filenames and rules
├── js/
│   ├── app.js                       # Application controller
│   ├── config/
│   │   └── appConfig.js             # UI defaults and labels
│   ├── data/
│   │   ├── fixedData.js             # Hidden engine-only person/room constants
│   │   ├── posesData.js
│   │   ├── scenesData.js
│   │   ├── cameraData.js
│   │   ├── lightingData.js
│   │   ├── clothingData.js
│   │   ├── expressionsData.js
│   │   └── hairData.js
│   ├── policies/
│   │   ├── authorityPolicy.js
│   │   ├── masterPolicy.js
│   │   └── roomLockPolicy.js
│   ├── engines/
│   │   ├── sceneEngine.js
│   │   ├── poseEngine.js
│   │   ├── cameraEngine.js
│   │   ├── lightingEngine.js
│   │   ├── identityEngine.js
│   │   ├── roomLockEngine.js
│   │   ├── validator.js
│   │   └── promptEngine.js
│   ├── ui/
│   │   ├── dom.js
│   │   ├── smartMode.js
│   │   ├── manualMode.js
│   │   ├── promptDisplay.js
│   │   ├── conflictModal.js
│   │   └── scenePicker.js
│   └── utils/
│       ├── imageHandler.js
│       ├── clipboard.js
│       ├── download.js
│       └── storage.js
└── tests/
    └── run-tests.mjs               # Optional engine regression tests
```

## Run locally

No installation or build is required. ES modules need an HTTP origin, so start any simple static server from the project root:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

Optional engine regression tests (Node.js is used only for tests, never by the application):

```bash
node tests/run-tests.mjs
```

## Usage

1. Upload IMAGE A as the identity reference.
2. Upload IMAGE B as the room reference recommended by the scene card.
3. Choose Smart mode for strict automatic scene matching or Manual mode to choose the reference yourself.
4. Select pose, body direction, room mode, camera, lens, expression, hair, clothing, and lighting.
5. Resolve red conflicts. Warnings about missing previews do not block prompt generation.
6. Copy FINAL PROMPT and attach the same IMAGE A and IMAGE B inside ChatGPT.

Images are represented only by temporary browser object URLs and are discarded when the tab closes. They are never written to `localStorage`.

## Add real scene images

Read [`scenes/README.md`](scenes/README.md), then add the required files to `scenes/`. If a new reference needs different compatibility metadata, update `js/data/scenesData.js` in the same commit. The validator trusts metadata, so it must describe only what is truly visible.

## GitHub setup

For the exact Pages URL `https://emadaden77.github.io/prompt-studio/`, the repository name must be exactly `prompt-studio`:

```bash
git init
git add .
git commit -m "Launch AI Selfie Prompt Studio"
git branch -M main
git remote add origin https://github.com/emadaden77/prompt-studio.git
git push -u origin main
```

Then open the repository on GitHub:

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**.
4. Save and wait for the deployment status to become active.

No base-path configuration is needed because all application URLs are relative.

## Download as ZIP

On GitHub, choose **Code → Download ZIP**, or use:

```text
https://github.com/emadaden77/prompt-studio/archive/refs/heads/main.zip
```

## Architectural decisions

- **Native ES modules:** keep the runtime dependency-free while preserving strict module boundaries.
- **Data-driven engines:** UI options, physics, and scene compatibility come from immutable data modules instead of duplicated conditionals.
- **Mandatory filtering before scoring:** prevents a high score from selecting a physically wrong room region.
- **Explicit support surfaces:** avoids unreliable substring matching between furniture names and body-contact requirements.
- **Dependency injection in PromptEngine:** makes authority, physics, camera, lighting, and room-lock text independently testable.
- **Warnings vs conflicts:** missing local previews remain warnings; impossible geometry, absent sources, and authority violations block copying.
- **Private browser previews:** object URLs avoid image persistence and network upload.
- **No framework or build tool:** minimizes GitHub Pages failure modes and makes every deployed source file inspectable.

## Security and honesty

The project intentionally excludes EXIF spoofing, C2PA removal, PRNU simulation, forensic countermeasures, and other deceptive provenance techniques. It also avoids passwords, API keys, analytics, trackers, and remote image uploads.

## Credits

Product concept and room-photography requirements: Emad Aden. Architecture and implementation: AI Selfie Prompt Studio project.
