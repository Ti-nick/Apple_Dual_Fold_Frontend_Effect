/**
 * FoldFlip — a dependency-free card-style fold/flip effect.
 *
 * Every page is a real <img> already written into the HTML (see
 * index.html), not created or given a src by this script — that's what
 * lets the browser start loading all three of them the moment it parses
 * the page, instead of only once this script has downloaded and run.
 * Each page sits in a fixed left or right slot (its role never changes),
 * so this class only ever shows/hides existing elements and triggers
 * their turn; it never touches `src`.
 *
 * There are exactly two states: closed (just the cover, alone on the
 * right, like the outside of a shut card) and open (an inside-left and
 * inside-right page shown as a spread). Toggling always animates exactly
 * one page — hinged at the fold's true center — while the opposite page
 * never moves.
 *
 * The same-side page revealed by a turn (e.g. inside-right, when
 * opening) is shown immediately, underneath the turning leaf, the
 * instant a toggle starts — it's what a real card looks like anyway: the
 * inside page is already there, emerging as the cover lifts away.
 *
 * The *opposite* side works differently, because nothing is turning
 * there yet — showing its replacement immediately would just pop with
 * no cover at all. Each leaf's back face is set (see wireBackFaces) to
 * the exact page that turn reveals on the far side — the same image
 * that page's own leaf already shows, reused from cache — so as the
 * leaf turns past 90° that's what the viewer already sees, real artwork
 * growing in. The underlying static leaf is still swapped underneath
 * once the turning leaf has had time to start covering it, so it's in
 * place by the time the leaf finishes and is hidden — but because both
 * now show the same image, that swap's exact timing isn't something the
 * eye can catch.
 *
 * A downloaded image isn't necessarily decoded yet — the browser can
 * still take a moment to turn the bytes into a paintable bitmap the
 * first time an image is actually shown, especially one that's been
 * sitting hidden. Every image starts decoding immediately (img.decode)
 * so that work is normally already done before it's needed; a toggle
 * still waits on it rather than assuming.
 */
class FoldFlip {
  /**
   * @param {HTMLElement} root - container with the fold-flip markup;
   *   its `.fold-flip__leaf` children, in DOM order, must be: cover,
   *   inside-left, inside-right.
   * @param {object} [options]
   * @param {string} [options.flipSound] - audio url played on each toggle
   * @param {number} [options.duration] - flip duration in ms
   */
  constructor(root, options = {}) {
    this.duration = options.duration || 650;
    this.sound = options.flipSound ? new Audio(options.flipSound) : null;
    if (this.sound) this.sound.preload = 'auto';

    const [cover, insideLeft, insideRight] = root.querySelectorAll('.fold-flip__leaf');
    this.closed = { left: null, right: cover };
    this.open = { left: insideLeft, right: insideRight };
    this.isOpen = false;
    this.animating = false;

    this.zone = root.querySelector('.fold-flip__zone');

    const leaves = [cover, insideLeft, insideRight];
    this.decoded = new Map();
    leaves.forEach((leaf) => {
      leaf.style.transitionDuration = `${this.duration}ms`;
      const img = leaf.querySelector('img');
      this.decoded.set(leaf, img && img.decode ? img.decode().catch(() => {}) : Promise.resolve());
    });

    this.wireBackFaces(leaves);

    this.zone.addEventListener('click', () => this.toggle());

    this.showOnly(this.closed);
  }

  // Gives each leaf's back face the exact page its own turn will reveal on
  // the far side: a right-slot leaf turns forward, landing on the left, so
  // its back face gets the *next* leaf's image; a left-slot leaf turns
  // backward onto the right, so it gets the *previous* leaf's image.
  // Reuses the neighbor's own <img>'s src, so the browser serves it from
  // cache rather than fetching anything extra.
  wireBackFaces(leaves) {
    leaves.forEach((leaf, i) => {
      const isRightSlot = leaf.classList.contains('fold-flip__leaf--right-slot');
      const neighbor = leaves[isRightSlot ? i + 1 : i - 1];
      const neighborImg = neighbor && neighbor.querySelector('img');
      if (!neighborImg) return;
      const img = document.createElement('img');
      img.src = neighborImg.src;
      img.alt = '';
      leaf.querySelector('.fold-flip__leaf-face--back').appendChild(img);
    });
  }

  // Shows exactly the leaves belonging to `state`, hiding every other one.
  showOnly(state) {
    [this.closed, this.open].forEach(({ left, right }) => {
      if (left) left.hidden = left !== state.left;
      if (right) right.hidden = right !== state.right;
    });
  }

  whenDecoded(state) {
    return Promise.all(
      [state.left, state.right].filter(Boolean).map((leaf) => this.decoded.get(leaf))
    );
  }

  wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  toggle() {
    if (this.animating) return;
    this.animating = true;

    const forward = !this.isOpen;
    const current = this.isOpen ? this.open : this.closed;
    const next = this.isOpen ? this.closed : this.open;
    const turningLeaf = forward ? current.right : current.left;
    const sameSideNext = forward ? next.right : next.left;
    const oppositeOld = forward ? current.left : current.right;
    const oppositeNext = forward ? next.left : next.right;

    this.whenDecoded(next).then(() => {
      // Sits underneath the turning leaf from the very start, so it's what
      // shows through as that leaf's own rotation narrows it away — not a
      // separately-timed reveal.
      if (sameSideNext) sameSideNext.hidden = false;

      turningLeaf.classList.add('fold-flip__leaf--turning');

      if (this.sound) {
        try {
          this.sound.currentTime = 0;
          this.sound.play().catch(() => {});
        } catch (e) {
          // Playback blocked/unsupported — fail silently.
        }
      }

      // Just past the halfway point, the turning leaf's back face (already
      // showing this same page — see wireBackFaces) has swept across
      // covering the opposite side, so swapping the static leaf underneath
      // now is invisible either way.
      this.wait(this.duration * 0.55).then(() => {
        if (oppositeOld) oppositeOld.hidden = true;
        if (oppositeNext) oppositeNext.hidden = false;

        this.wait(this.duration * 0.45).then(() => {
          turningLeaf.classList.remove('fold-flip__leaf--turning');
          turningLeaf.hidden = true;
          this.isOpen = forward;
          this.animating = false;
        });
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FoldFlip(document.getElementById('fold'), {
    flipSound: 'assets/page-flip.mp3',
  });
});
