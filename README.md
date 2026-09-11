# Fold Flip Effect

A dependency-free two-sided fold/flip effect built with plain HTML, CSS, and JavaScript — no React, no build step. Tap a panel to open it, tap again to fold it back, like a fold-phone hinge. Drop the three files into any project and it works.

## Usage

Copy `index.html`, `style.css`, `script.js`, and the `assets/` folder into your project (or just `style.css` + `script.js` + your own markup and images).

Both faces are real `<img>` elements written directly in the HTML — **not** inserted by JavaScript — so the browser starts loading both immediately:

```html
<div class="fold-flip" id="fold">
  <div class="fold-flip__glow"></div>
  <div class="fold-flip__stage">
    <div class="fold-flip__panel">
      <div class="fold-flip__face fold-flip__face--front"><img src="assets/front.webp" alt=""></div>
      <div class="fold-flip__face fold-flip__face--back"><img src="assets/back.webp" alt=""></div>
    </div>
    <button class="fold-flip__zone" aria-label="Open or close"></button>
  </div>
</div>
```

```js
new FoldFlip(document.getElementById('fold'), {
  flipSound: 'assets/page-flip.mp3', // optional
});
```

Tap the panel to open it (front → back), tap again to close it (back → front).

## How it works

There's exactly one panel. Its front and back faces sit on the same element, hinged at its own left edge (`rotateY`, `backface-visibility: hidden`); toggling a class rotates it 180° one way to open and 180° back to close. Since both faces are real, already-loaded images on that one element rather than separate elements being swapped or revealed, there's no timing edge case to get wrong — nothing to reveal underneath, nothing that can show up mid-flip as a loading flash.

## Local dev

```
./serve.sh
```

then open http://localhost:8080.
