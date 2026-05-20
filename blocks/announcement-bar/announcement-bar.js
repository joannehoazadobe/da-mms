/**
 * Announcement Bar block.
 *
 * DA content structure (table block in document):
 * ┌──────────────────────────────────────────────────┐
 * │ Announcement Bar                                 │
 * ├──────────────────────────────────────────────────┤
 * │ 15% off bulk candy! use code [BREAK](/offer-...) │
 * ├──────────────────────────────────────────────────┤
 * │ free standard shipping on orders $75+! [details] │
 * └──────────────────────────────────────────────────┘
 *
 * Each row becomes one bar message.
 * The bar is dismissible and its dismissed state is stored in sessionStorage.
 */

const STORAGE_KEY = 'mms-announcement-dismissed';

export default function decorate(block) {
  const dismissed = sessionStorage.getItem(STORAGE_KEY);
  if (dismissed) {
    block.closest('.section')?.remove();
    return;
  }

  // Wrap all row content into individual message spans
  const rows = [...block.querySelectorAll(':scope > div')];
  const wrapper = document.createElement('div');
  wrapper.classList.add('announcement-bar-messages');

  rows.forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    const msg = document.createElement('p');
    msg.classList.add('announcement-bar-message');
    msg.innerHTML = cell.innerHTML;
    wrapper.append(msg);
    row.remove();
  });

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('announcement-bar-close');
  closeBtn.setAttribute('aria-label', 'Dismiss announcement');
  closeBtn.setAttribute('type', 'button');
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    block.closest('.section').style.setProperty('display', 'none');
  });

  block.append(wrapper, closeBtn);
}
