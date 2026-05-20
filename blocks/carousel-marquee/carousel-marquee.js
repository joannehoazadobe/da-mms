/**
 * Carousel Marquee block - horizontal scrolling text ticker.
 * Takes rows of text separated by "&" and creates an infinite scrolling marquee.
 */

const AMPERSAND_COLORS = [
  'var(--brand-brown)',
  'rgb(215, 1, 0)',
  'rgb(14, 116, 225)',
];

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  rows.forEach((row, rowIdx) => {
    // Get the text content from the cell
    const cell = row.querySelector(':scope > div');
    const text = cell ? cell.textContent.trim() : '';

    // Split by "&" to get individual words
    const words = text.split('&').map((w) => w.trim()).filter(Boolean);

    // Clear the row
    row.innerHTML = '';
    row.classList.add('carousel-marquee-track');
    if (rowIdx === 1) row.classList.add('carousel-marquee-track-reverse');

    // Create a track group (will be duplicated for seamless loop)
    const trackContent = document.createElement('div');
    trackContent.classList.add('carousel-marquee-track-content');

    let ampersandIndex = 0;
    words.forEach((word) => {
      // Add word span
      const wordSpan = document.createElement('span');
      wordSpan.classList.add('carousel-marquee-word');
      wordSpan.textContent = word;
      trackContent.appendChild(wordSpan);

      // Add ampersand separator after each word (including last for seamless loop)
      const ampSpan = document.createElement('span');
      ampSpan.classList.add('carousel-marquee-amp');
      ampSpan.textContent = '&';
      ampSpan.style.color = AMPERSAND_COLORS[ampersandIndex % AMPERSAND_COLORS.length];
      ampersandIndex += 1;
      trackContent.appendChild(ampSpan);
    });

    // Duplicate the track content multiple times for seamless scrolling
    const duplicates = 6;
    for (let i = 0; i < duplicates; i += 1) {
      const clone = trackContent.cloneNode(true);
      row.appendChild(clone);
    }
  });
}
