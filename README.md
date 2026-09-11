# Book Flip Effect

A dependency-free page-flip book effect built with plain HTML, CSS, and JavaScript — no React, no build step. Drop the three files into any project and it works.

## Usage

Copy `index.html`, `style.css`, `script.js`, and the `assets/` folder into your project (or just `style.css` + `script.js` + your own markup and images).

Write every page as a real `<img>` directly in the HTML — **not** inserted by JavaScript — so the browser starts loading all of them the moment it parses the page, in parallel with everything else, instead of only once your script has downloaded and run. Each page sits in a fixed left or right slot; alternate `--left-slot` / `--right-slot`, starting with `--right-slot` for the cover:

```html
<div class="book-flip" id="book">
  <div class="book-flip__glow"></div>
  <div class="book-flip__stage">
    <div class="book-flip__leaf book-flip__leaf--right-slot">
      <div class="book-flip__leaf-face book-flip__leaf-face--front"><img src="assets/cover.webp" alt=""></div>
      <div class="book-flip__leaf-face book-flip__leaf-face--back"></div>
    </div>
    <div class="book-flip__leaf book-flip__leaf--left-slot" hidden>
      <div class="book-flip__leaf-face book-flip__leaf-face--front"><img src="assets/page-01.webp" alt=""></div>
      <div class="book-flip__leaf-face book-flip__leaf-face--back"></div>
    </div>
    <div class="book-flip__leaf book-flip__leaf--right-slot" hidden>
      <div class="book-flip__leaf-face book-flip__leaf-face--front"><img src="assets/page-02.webp" alt=""></div>
      <div class="book-flip__leaf-face book-flip__leaf-face--back"></div>
    </div>
    <!-- ...one .book-flip__leaf per interior page, alternating slots... -->
    <div class="book-flip__leaf book-flip__leaf--left-slot" hidden>
      <div class="book-flip__leaf-face book-flip__leaf-face--front"><img src="assets/back-cover.webp" alt=""></div>
      <div class="book-flip__leaf-face book-flip__leaf-face--back"></div>
    </div>
    <button class="book-flip__zone book-flip__zone--prev" aria-label="Previous page"></button>
    <button class="book-flip__zone book-flip__zone--next" aria-label="Next page"></button>
  </div>
</div>
```

```js
new BookFlip(document.getElementById('book'), {
  flipSound: 'assets/page-flip.mp3', // optional
  duration: 650, // optional, ms
});
```

Click (or tap) the left/right half of the book to turn a page. See `index.html` for a full 12-page example.

## How it works

Every page is a real `<img>` already sitting in the DOM, not created or given a `src` by JavaScript — that's the whole trick to avoiding a visible load flash: the browser's own preload scanner discovers and starts fetching every page as soon as it parses the HTML, well before `script.js` even downloads.

Content is a sequence of spreads, each with a left and/or right page — the cover is a spread with only a right page (nothing precedes it) and the back cover has only a left page (nothing follows it), so they're already sized and positioned like a single interior page rather than a wide double-page card. Each page's slot (left or right) is fixed, so its hinge edge and turn direction are baked into CSS rather than computed per turn. Turning a page always animates exactly one page — hinged at the book's true center (`rotateY`) — while the opposite page never moves. Each leaf's back face is a plain paper gradient, and the next spread is revealed underneath while the leaf is edge-on (and momentarily invisible) mid-turn, so no leaf ever needs artwork on both sides.

## Local dev

```
./serve.sh
```

then open http://localhost:8080.
