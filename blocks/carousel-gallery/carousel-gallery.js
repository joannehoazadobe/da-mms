import { fetchPlaceholders } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-gallery');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-gallery-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });
}

function scrollToSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-gallery-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-gallery-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  block.querySelector('.slide-prev').addEventListener('click', () => {
    scrollToSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    scrollToSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-gallery-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.classList.add('carousel-gallery-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-gallery-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-gallery-${carouselId}`);
  const rows = [...block.querySelectorAll(':scope > div')];

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  // First row is the header (h2 + description + hashtag) - render above the gallery
  const headerRow = rows[0];
  const headerDiv = document.createElement('div');
  headerDiv.classList.add('carousel-gallery-header');
  const footerDiv = document.createElement('div');
  footerDiv.classList.add('carousel-gallery-footer');

  headerRow.querySelectorAll(':scope > div').forEach((col) => {
    while (col.firstChild) {
      headerDiv.appendChild(col.firstChild);
    }
  });
  headerRow.remove();

  // Move the last paragraph (hashtag) from header to footer (below gallery)
  const paragraphs = headerDiv.querySelectorAll('p');
  if (paragraphs.length > 1) {
    const lastP = paragraphs[paragraphs.length - 1];
    if (lastP.textContent.startsWith('#')) {
      footerDiv.appendChild(lastP);
    }
  }

  // Remaining rows are gallery photo items
  const photoRows = rows.slice(1);

  const container = document.createElement('div');
  container.classList.add('carousel-gallery-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-gallery-slides');

  const slideNavButtons = document.createElement('div');
  slideNavButtons.classList.add('carousel-gallery-navigation-buttons');
  slideNavButtons.innerHTML = `
    <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
    <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
  `;

  container.append(slideNavButtons);

  photoRows.forEach((row, idx) => {
    const slide = createSlide(row, idx);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);

  // Clear block and rebuild: header on top, gallery in middle, hashtag at bottom
  block.textContent = '';
  block.append(headerDiv);
  block.append(container);
  if (footerDiv.hasChildNodes()) {
    block.append(footerDiv);
  }

  bindEvents(block);
}
