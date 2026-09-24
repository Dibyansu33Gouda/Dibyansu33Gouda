# Dibyansu 3D Contribution Snake

This is the part that can run **inside the native GitHub contribution calendar** shown in your screenshot.

It is a browser extension, so it changes the calendar only in the browser where you install it. GitHub Actions and profile README files cannot inject JavaScript into GitHub's own contribution-card component for every visitor.

## What it does

- Finds the real contribution tiles rendered by GitHub
- Draws raised isometric 3D blocks over those tiles
- Uses the native contribution intensity levels
- Animates a neon snake through the grid
- Eats positive-contribution cells from lower level to higher level
- Supports GitHub dark and light themes
- Includes pause, replay, and close controls

## Install in Chrome, Edge, or Firefox

1. Open the browser's extensions page:
   - Chrome/Edge: `chrome://extensions` or `edge://extensions`
   - Firefox: `about:debugging#/runtime/this-firefox`
2. Enable **Developer mode** in Chrome/Edge.
3. Choose **Load unpacked** (Chrome/Edge) or **Load Temporary Add-on** (Firefox).
4. Select this `native-graph-extension` folder, or select its `manifest.json` file in Firefox.
5. Open or refresh `https://github.com/Dibyansu33Gouda`.

The extension is limited to the `Dibyansu33Gouda` profile by the `TARGET_USER` constant in `content.js`. The animation starts automatically when the contribution calendar has loaded.

### Controls

- **Pause / Play** button in the small `3D SNAKE` toolbar
- **Replay** starts the low-to-high pass again
- **Close** hides the overlay until the page is refreshed
- Press `Escape` to hide it

## Important difference

This overlay is local to your browser. Other people will see their normal GitHub calendar unless they install the extension too. The public profile package in the parent folder separately adds an animated README snake and a daily-generated 3D contribution skyline for everyone.
