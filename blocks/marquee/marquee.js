/**
 * Marquee (ticker) block.
 *
 * DA content structure:
 * ┌─────────────────────────────────────────────────────┐
 * │ Marquee                                             │
 * ├─────────────────────────────────────────────────────┤
 * │ diploma & cap & gown & congratulations & celebration │
 * └─────────────────────────────────────────────────────┘
 *
 * The single row of text is repeated and scrolled via CSS animation.
 * A separator character (default •) is placed between repetitions.
 *
 * Optional variant class "marquee-reverse" scrolls right-to-left.
 */

const REPEAT_COUNT = 4; // how many copies of the text to keep in the DOM
const SEPARATOR = ' & ';

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  const rawText = cell.textContent.trim();

  // Build a single track element
  const track = document.createElement('div');
  track.classList.add('marquee-track');

  // Clone the text REPEAT_COUNT times so the loop appears seamless
  for (let i = 0; i < REPEAT_COUNT; i += 1) {
    const span = document.createElement('span');
    span.classList.add('marquee-item');
    span.textContent = rawText + SEPARATOR;
    span.setAttribute('aria-hidden', i > 0 ? 'true' : 'false');
    track.append(span);
  }

  // Replace cell content with the scrolling track
  cell.replaceChildren(track);
  cell.classList.add('marquee-inner');
}
