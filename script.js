/**
 * BookFlip — a dependency-free page-flip book effect.
 *
 * Every page is a real <img> already written into the HTML (see
 * index.html), not created or given a src by this script — that's what
 * lets the browser start loading all of them the moment it parses the
 * page, instead of only once this script has downloaded and run. Each
 * page sits in a fixed left or right slot (its role never changes), so
 * this class only ever shows/hides existing elements and triggers their
 * turn; it never touches `src`.
 *
 * Content is modeled as a sequence of spreads, each `{ left, right }`
 * where either side can be null: the cover is a spread with only a right
 * page (nothing precedes it) and the back cover only a left page
 * (nothing follows it), so they're already single-page width, sitting at
 * the same spine position as any interior page.
 *
 * Turning a page always animates exactly one page — hinged at the book's
 * true center (the spine) — while the opposite page never moves. Each
 * leaf's back face is a plain paper texture, and the next spread is
 * revealed underneath while the leaf is edge-on (and therefore invisible)
 * at the midpoint of the turn.
 */
class BookFlip {
  /**
   * @param {HTMLElement} root - container with the book-flip markup;
   *   its `.book-flip__leaf` children, in DOM order, must be:
   *   cover, then each interior page in reading order, then back cover.
   * @param {object} [options]
   * @param {string} [options.flipSound] - audio url played on each turn
   * @param {number} [options.duration] - flip duration in ms
   */
  constructor(root, options = {}) {
    this.duration = options.duration || 650;
    this.sound = options.flipSound ? new Audio(options.flipSound) : null;
    if (this.sound) this.sound.preload = 'auto';

    const leaves = Array.from(root.querySelectorAll('.book-flip__leaf'));
    this.spreads = [{ left: null, right: leaves[0] }];
    for (let i = 1; i < leaves.length - 1; i += 2) {
      this.spreads.push({ left: leaves[i], right: leaves[i + 1] });
    }
    this.spreads.push({ left: leaves[leaves.length - 1], right: null });

    this.index = 0;
    this.animating = false;

    this.spine = root.querySelector('.book-flip__spine');
    this.prevBtn = root.querySelector('.book-flip__zone--prev');
    this.nextBtn = root.querySelector('.book-flip__zone--next');

    leaves.forEach((leaf) => {
      leaf.style.transitionDuration = `${this.duration}ms`;
    });

    this.prevBtn.addEventListener('click', () => this.turn(-1));
    this.nextBtn.addEventListener('click', () => this.turn(1));

    this.showOnly(this.spreads[0]);
    this.updateControls();
  }

  // Shows exactly the leaves belonging to `spread`, hiding every other one.
  showOnly(spread) {
    this.spreads.forEach(({ left, right }) => {
      if (left) left.hidden = left !== spread.left;
      if (right) right.hidden = right !== spread.right;
    });
    this.spine.hidden = !(spread.left && spread.right);
  }

  updateControls() {
    this.prevBtn.disabled = this.animating || this.index === 0;
    this.nextBtn.disabled = this.animating || this.index === this.spreads.length - 1;
  }

  turn(direction) {
    const targetIndex = this.index + direction;
    if (this.animating || targetIndex < 0 || targetIndex >= this.spreads.length) return;

    this.animating = true;
    this.updateControls();

    const current = this.spreads[this.index];
    const next = this.spreads[targetIndex];
    const forward = direction === 1;
    const turningLeaf = forward ? current.right : current.left;

    turningLeaf.classList.add('book-flip__leaf--turning');

    if (this.sound) {
      try {
        this.sound.currentTime = 0;
        this.sound.play().catch(() => {});
      } catch (e) {
        // Playback blocked/unsupported — fail silently.
      }
    }

    window.setTimeout(() => {
      // The turning leaf is edge-on (and hides whatever's behind it) right
      // about now, so this is when the spread underneath actually changes.
      const oldOther = forward ? current.left : current.right;
      if (oldOther) oldOther.hidden = true;
      if (next.left) next.left.hidden = false;
      if (next.right) next.right.hidden = false;
      this.spine.hidden = !(next.left && next.right);
    }, this.duration / 2);

    window.setTimeout(() => {
      turningLeaf.classList.remove('book-flip__leaf--turning');
      turningLeaf.hidden = true;
      this.index = targetIndex;
      this.animating = false;
      this.updateControls();
    }, this.duration);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BookFlip(document.getElementById('book'), {
    flipSound: 'assets/page-flip.mp3',
  });
});
