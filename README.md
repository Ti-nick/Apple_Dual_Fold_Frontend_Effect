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
    <img class="book-flip__page book-flip__page--single" alt="">
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
  cover: 'assets/cover.png',
  backCover: 'assets/back-cover.png',
  pages: ['page-01.png', 'page-02.png', /* ...in reading order, pairs become spreads */],
  flipSound: 'assets/page-flip.mp3', // optional
});
```

Click (or tap) the left/right half of the book to turn a page.

## How it works

The cover and back cover are shown alone at full width; interior pages are shown two at a time as a left/right spread on either side of a fixed center spine. Turning an interior page animates only that one page — hinged at the spine (`rotateY`, half the book's width) — while the opposite page never moves. Turning the cover open or closed animates the whole book as one rigid card instead, hinged at the outer edge, since a cover has no spine of its own. Either way, the flipping leaf's back face is a plain paper gradient and the next spread is swapped in underneath while the leaf is edge-on (and momentarily invisible) mid-turn, so no leaf ever needs artwork on both sides.

## Local dev

```
./serve.sh
```

then open http://localhost:8080.
