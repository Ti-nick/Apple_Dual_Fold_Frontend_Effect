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
 * true center (the spine) — while the opposite page never moves. A 3D
 * rotateY doesn't just swap content at 90°, though: as the turning leaf
 * foreshortens toward edge-on, its rendered width shrinks well before
 * that, and past 90° it's showing its back face while still narrow — so
 * anything relying on a fixed "reveal at the halfway point" timer either
 * exposes a gap (this page's own background showing through) or reveals
 * too early/late, since easing makes the real edge-on moment land at a
 * different point than the wall-clock midpoint. So the same-side
 * replacement page (e.g. the new right page, turning right) is shown
 * immediately, underneath the turning leaf, the instant a turn starts —
 * it's what a real page turn looks like anyway: the next page is already
 * there, emerging as the old one lifts away. Only the *opposite* side
 * (which the turning leaf's blank paper back sweeps over later) still
 * needs its swap timed, and now against the fixed easing curve below
 * rather than an arbitrary one.
 *
 * A downloaded image isn't necessarily decoded yet — the browser can
 * still take a moment to turn the bytes into a paintable bitmap the
 * first time an image is actually shown, especially one that's been
 * sitting hidden. Every image starts decoding immediately (img.decode)
 * so that work is normally already done well before it's revealed; a
 * turn still waits on it rather than assuming, so a page is never
 * revealed as a blank frame that then pops in.
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

    this.decoded = new Map();
    leaves.forEach((leaf) => {
      leaf.style.transitionDuration = `${this.duration}ms`;
      const img = leaf.querySelector('img');
      this.decoded.set(leaf, img && img.decode ? img.decode().catch(() => {}) : Promise.resolve());
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

  whenDecoded(spread) {
    return Promise.all(
      [spread.left, spread.right].filter(Boolean).map((leaf) => this.decoded.get(leaf))
    );
  }

  wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
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
    const sameSideNext = forward ? next.right : next.left;
    const oppositeOld = forward ? current.left : current.right;
    const oppositeNext = forward ? next.left : next.right;

    this.whenDecoded(next).then(() => {
      // Sits underneath the turning leaf from the very start, so it's what
      // shows through as that leaf's own rotation narrows it away — not a
      // separately-timed reveal.
      if (sameSideNext) sameSideNext.hidden = false;

      turningLeaf.classList.add('book-flip__leaf--turning');

      if (this.sound) {
        try {
          this.sound.currentTime = 0;
          this.sound.play().catch(() => {});
        } catch (e) {
          // Playback blocked/unsupported — fail silently.
        }
      }

      // Just past the halfway point, the turning leaf's blank paper back has
      // swept across covering the opposite side, so this swap happens
      // underneath it — slightly past the midpoint rather than exactly on
      // it, so the swap lands after the leaf has already started covering
      // that side rather than right at its thinnest, edge-on instant.
      this.wait(this.duration * 0.55).then(() => {
        if (oppositeOld) oppositeOld.hidden = true;
        if (oppositeNext) oppositeNext.hidden = false;
        this.spine.hidden = !(next.left && next.right);

        this.wait(this.duration * 0.45).then(() => {
          turningLeaf.classList.remove('book-flip__leaf--turning');
          turningLeaf.hidden = true;
          this.index = targetIndex;
          this.animating = false;
          this.updateControls();
        });
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BookFlip(document.getElementById('book'), {
    flipSound: 'assets/page-flip.mp3',
  });
});
