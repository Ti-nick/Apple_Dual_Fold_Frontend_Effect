# Book Flip Effect

A dependency-free page-flip book effect built with plain HTML, CSS, and JavaScript — no React, no build step. Drop the three files into any project and it works.

## Usage

Copy `index.html`, `style.css`, `script.js`, and the `assets/` folder into your project (or just `style.css` + `script.js` + your own markup and images).

```html
<div class="book-flip" id="book">
  <div class="book-flip__glow"></div>
  <div class="book-flip__stage">
    <img class="book-flip__page book-flip__page--left" alt="">
    <img class="book-flip__page book-flip__page--right" alt="">
    <div class="book-flip__spine" hidden></div>
    <div class="book-flip__leaf" hidden>
      <div class="book-flip__leaf-face book-flip__leaf-face--front"></div>
      <div class="book-flip__leaf-face book-flip__leaf-face--back"></div>
    </div>
    <button class="book-flip__zone book-flip__zone--prev" aria-label="Previous page"></button>
    <button class="book-flip__zone book-flip__zone--next" aria-label="Next page"></button>
  </div>
</div>
```

```js
new BookFlip(document.getElementById('book'), {
  cover: 'assets/cover.webp',
  backCover: 'assets/back-cover.webp',
  pages: ['page-01.webp', 'page-02.webp', /* ...in reading order, pairs become spreads */],
  flipSound: 'assets/page-flip.mp3', // optional
});
```

Click (or tap) the left/right half of the book to turn a page.

## How it works

Content is a sequence of spreads, each with a left and/or right page — the cover is a spread with only a right page (nothing precedes it) and the back cover has only a left page (nothing follows it), so they're already sized and positioned like a single interior page rather than a wide double-page card. Turning a page always animates exactly one page — a leaf the width of a single page, hinged at the book's true center (`rotateY`) — while the opposite page never moves. The leaf's back face is a plain paper gradient, and the next spread is swapped in underneath while the leaf is edge-on (and momentarily invisible) mid-turn, so no leaf ever needs artwork on both sides.

## Local dev

```
./serve.sh
```

then open http://localhost:8080.
