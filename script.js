/**
 * BookFlip — a dependency-free page-flip book effect.
 *
 * Content is modeled as a sequence of "spreads": the front/back cover are
 * shown alone at full width, interior pages are shown two at a time
 * (a left/right pair) on either side of a fixed center spine.
 *
 * Two kinds of turns:
 *  - Interior spread <-> spread: only the page being turned animates,
 *    hinged at the spine (the container's true center) — the opposite
 *    page never moves. The turning leaf is half the book's width, its
 *    front face shows the page currently on that side, and its back
 *    face is a plain paper texture. The new spread is swapped in
 *    underneath while the leaf is edge-on (and therefore invisible) at
 *    the midpoint of the turn.
 *  - Cover <-> first/last spread: the cover has no spine of its own, so
 *    it flips open/closed as one rigid full-width card, hinged at the
 *    book's outer edge.
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

    // Build the list of spreads: [{ single: url }] or [{ left: url, right: url }]
    this.spreads = [{ single: options.cover }];
    for (let i = 0; i < options.pages.length; i += 2) {
      this.spreads.push({ left: options.pages[i], right: options.pages[i + 1] });
    }
    this.spreads.push({ single: options.backCover });

    this.index = 0;
    this.animating = false;

    this.leftImg = root.querySelector('.book-flip__page--left');
    this.rightImg = root.querySelector('.book-flip__page--right');
    this.singleImg = root.querySelector('.book-flip__page--single');
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
    if (spread.single) {
      this.singleImg.src = spread.single;
      this.singleImg.hidden = false;
      this.leftImg.hidden = true;
      this.rightImg.hidden = true;
      this.spine.hidden = true;
    } else {
      this.leftImg.src = spread.left;
      this.rightImg.src = spread.right;
      this.leftImg.hidden = false;
      this.rightImg.hidden = false;
      this.singleImg.hidden = true;
      this.spine.hidden = false;
    }
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

    // Only a cover has no spine of its own, so only a turn touching a
    // single (cover/back-cover) spread uses the whole-card animation;
    // an ordinary interior turn hinges just the one page at the spine.
    if (current.single || next.single) {
      this.setLeafFront(current);
      this.leaf.style.left = '0';
      this.leaf.style.width = '100%';
    } else if (forward) {
      this.setLeafFrontImage(current.right);
      this.leaf.style.left = '50%';
      this.leaf.style.width = '50%';
    } else {
      this.setLeafFrontImage(current.left);
      this.leaf.style.left = '0';
      this.leaf.style.width = '50%';
    }

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

  setLeafFront(spread) {
    if (spread.single) {
      this.setLeafFrontImage(spread.single);
      return;
    }
    this.leafFront.innerHTML = '';
    const left = document.createElement('img');
    left.src = spread.left;
    left.alt = '';
    left.style.cssText = 'width:50%;height:100%;object-fit:cover;float:left;display:block;';
    const right = document.createElement('img');
    right.src = spread.right;
    right.alt = '';
    right.style.cssText = 'width:50%;height:100%;object-fit:cover;float:left;display:block;';
    this.leafFront.appendChild(left);
    this.leafFront.appendChild(right);
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
