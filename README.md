# Fold Flip Effect

A dependency-free card-style fold/flip effect built with plain HTML, CSS, and JavaScript — no React, no build step. Tap the cover to open it and reveal an inside-left/inside-right spread, tap again to close it back to the cover, like opening a greeting card. Drop the three files into any project and it works.

## Usage

Copy `index.html`, `style.css`, `script.js`, and the `assets/` folder into your project (or just `style.css` + `script.js` + your own markup and images).

Every page is a real `<img>` written directly in the HTML — **not** inserted by JavaScript — so the browser starts loading all three immediately. The cover sits alone in the right slot at rest (nothing to its left, like the outside of a shut card); opening it reveals the inside-left and inside-right pages as a spread:

```html
<div class="fold-flip" id="fold">
  <div class="fold-flip__glow"></div>
  <div class="fold-flip__stage">
    <div class="fold-flip__leaf fold-flip__leaf--right-slot">
      <div class="fold-flip__leaf-face fold-flip__leaf-face--front"><img src="assets/front.webp" alt=""></div>
      <div class="fold-flip__leaf-face fold-flip__leaf-face--back"></div>
    </div>
    <div class="fold-flip__leaf fold-flip__leaf--left-slot" hidden>
      <div class="fold-flip__leaf-face fold-flip__leaf-face--front"><img src="assets/inside-left.webp" alt=""></div>
      <div class="fold-flip__leaf-face fold-flip__leaf-face--back"></div>
    </div>
    <div class="fold-flip__leaf fold-flip__leaf--right-slot" hidden>
      <div class="fold-flip__leaf-face fold-flip__leaf-face--front"><img src="assets/inside-right.webp" alt=""></div>
      <div class="fold-flip__leaf-face fold-flip__leaf-face--back"></div>
    </div>
    <button class="fold-flip__zone" aria-label="Open or close"></button>
  </div>
</div>
```

```js
new FoldFlip(document.getElementById('fold'), {
  flipSound: 'assets/page-flip.mp3', // optional
  duration: 650, // optional, ms
});
```

Tap anywhere on the fold to open it (cover → spread), tap again to close it (spread → cover).

## How it works

Every page is a real `<img>` already sitting in the DOM, not created or given a `src` by JavaScript — the browser's own preload scanner discovers and starts fetching all three as soon as it parses the HTML, well before `script.js` even downloads.

There are exactly two states: closed (just the cover, single-page width, alone in the right slot) and open (a left/right spread). Toggling always animates exactly one page — hinged at the fold's true center (`rotateY`) — while the opposite page never moves. Each leaf's back face is set at init to the exact page its own turn reveals on the far side, reusing that page's own cached image rather than a plain color, so real artwork grows in as it turns instead of a blank card. There are no shadows or shading anywhere — flat, clean faces by design.

## Local dev

```
./serve.sh
```

then open http://localhost:8080.
