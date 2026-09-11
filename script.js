/**
 * FoldFlip — a dependency-free two-sided fold/flip effect.
 *
 * There is exactly one panel, with a front and back face that are both
 * real <img> elements already written into the HTML (see index.html) —
 * not created or given a src by this script. Opening and closing just
 * rotates that same panel 180° back and forth around its own center, so
 * it stays in the same spot rather than swinging out like a door. There's
 * no separate element being swapped in or revealed underneath, so there's
 * nothing that can show up as a loading flash partway through.
 */
class FoldFlip {
  /**
   * @param {HTMLElement} root - container with the fold-flip markup
   * @param {object} [options]
   * @param {string} [options.flipSound] - audio url played on each toggle
   */
  constructor(root, options = {}) {
    this.panel = root.querySelector('.fold-flip__panel');
    this.zone = root.querySelector('.fold-flip__zone');
    this.open = false;
    this.sound = options.flipSound ? new Audio(options.flipSound) : null;
    if (this.sound) this.sound.preload = 'auto';

    this.zone.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.open = !this.open;
    this.panel.classList.toggle('fold-flip__panel--open', this.open);

    if (this.sound) {
      try {
        this.sound.currentTime = 0;
        this.sound.play().catch(() => {});
      } catch (e) {
        // Playback blocked/unsupported — fail silently.
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FoldFlip(document.getElementById('fold'), {
    flipSound: 'assets/page-flip.mp3',
  });
});
