/**
 * BookFlip — a dependency-free page-flip book effect.
 *
 * Content is modeled as a sequence of spreads, each `{ left, right }` where
 * either side can be null. Interior spreads have both sides; the cover is
 * a spread with only a right page (nothing precedes it) and the back cover
 * is a spread with only a left page (nothing follows it) — so the cover
 * and back cover are already single-page-wide, sitting right where an
 * interior page would.
 *
 * Turning a page always animates exactly one page — a leaf the width of a
 * single page, hinged at the book's true center (the spine) — while the
 * opposite page never moves. The leaf's front face shows the page
 * currently on that side; its back face is a plain paper texture, and the
 * next spread is swapped in underneath while the leaf is edge-on (and
 * therefore invisible) at the midpoint of the turn.
 */
class BookFlip {
  /**
   * @param {HTMLElement} root - container with the book-flip markup
   * @param {object} options
   * @param {string} options.cover - image url for the front cover
   * @param {string} options.backCover - image url for the back cover
   * @param {string[]} options.pages - interior page images, in reading
   *   order; grouped two at a time into left/right spreads
   * @param {string} [options.flipSound] - audio url played on each turn
   * @param {number} [options.duration] - flip duration in ms
   */
  constructor(root, options) {
    this.root = root;
    this.duration = options.duration || 650;
    this.sound = options.flipSound ? new Audio(options.flipSound) : null;
    if (this.sound) this.sound.preload = 'auto';

    this.spreads = [{ left: null, right: options.cover }];
    for (let i = 0; i < options.pages.length; i += 2) {
      this.spreads.push({ left: options.pages[i], right: options.pages[i + 1] });
    }
    this.spreads.push({ left: options.backCover, right: null });

    this.index = 0;
    this.animating = false;

    this.leftImg = root.querySelector('.book-flip__page--left');
    this.rightImg = root.querySelector('.book-flip__page--right');
    this.spine = root.querySelector('.book-flip__spine');
    this.leaf = root.querySelector('.book-flip__leaf');
    this.leafFront = root.querySelector('.book-flip__leaf-face--front');
    this.prevBtn = root.querySelector('.book-flip__zone--prev');
    this.nextBtn = root.querySelector('.book-flip__zone--next');

    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());

    this.render(this.spreads[0]);
    this.updateControls();
  }

  render(spread) {
    this.leftImg.hidden = !spread.left;
    if (spread.left) this.leftImg.src = spread.left;

    this.rightImg.hidden = !spread.right;
    if (spread.right) this.rightImg.src = spread.right;

    this.spine.hidden = !(spread.left && spread.right);
  }

  updateControls() {
    this.prevBtn.disabled = this.animating || this.index === 0;
    this.nextBtn.disabled = this.animating || this.index === this.spreads.length - 1;
  }

  next() {
    this.turn(1);
  }

  prev() {
    this.turn(-1);
  }

  turn(direction) {
    const targetIndex = this.index + direction;
    if (this.animating || targetIndex < 0 || targetIndex >= this.spreads.length) return;

    this.animating = true;
    this.updateControls();

    const current = this.spreads[this.index];
    const next = this.spreads[targetIndex];
    const forward = direction === 1;

    this.setLeafFrontImage(forward ? current.right : current.left);
    this.leaf.style.left = forward ? '50%' : '0';
    this.leaf.style.width = '50%';
    this.leaf.hidden = false;
    this.leaf.classList.toggle('book-flip__leaf--from-right', forward);
    this.leaf.classList.toggle('book-flip__leaf--from-left', !forward);
    this.leaf.style.transformOrigin = forward ? '0% 50%' : '100% 50%';
    this.leaf.style.transform = 'rotateY(0deg)';

    // Force layout so the transition below animates from 0deg.
    // eslint-disable-next-line no-unused-expressions
    this.leaf.offsetWidth;

    if (this.sound) {
      try {
        this.sound.currentTime = 0;
        this.sound.play().catch(() => {});
      } catch (e) {
        // Playback blocked/unsupported — fail silently.
      }
    }

    this.leaf.style.transform = forward ? 'rotateY(-180deg)' : 'rotateY(180deg)';

    window.setTimeout(() => {
      this.render(next);
    }, this.duration / 2);

    window.setTimeout(() => {
      this.leaf.hidden = true;
      this.index = targetIndex;
      this.animating = false;
      this.updateControls();
    }, this.duration);
  }

  setLeafFrontImage(src) {
    this.leafFront.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    this.leafFront.appendChild(img);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BookFlip(document.getElementById('book'), {
    cover: 'assets/cover.png',
    backCover: 'assets/back-cover.png',
    pages: [
      'assets/page-01.png',
      'assets/page-02.png',
      'assets/page-03.png',
      'assets/page-04.png',
      'assets/page-05.png',
      'assets/page-06.png',
      'assets/page-07.png',
      'assets/page-08.png',
      'assets/page-09.png',
      'assets/page-10.png',
    ],
    flipSound: 'assets/page-flip.mp3',
  });
});
