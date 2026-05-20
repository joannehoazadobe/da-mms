/**
 * Newsletter signup block.
 *
 * DA content structure:
 * ┌──────────────────────────────────────────────────────────────┐
 * │ Newsletter                                                   │
 * ├──────────────────────────────────────────────────────────────┤
 * │ Heading text (e.g. "join the community for all deals")       │
 * ├──────────────────────────────────────────────────────────────┤
 * │ Fine print / legal text with links                           │
 * ├──────────────────────────────────────────────────────────────┤
 * │ Submit button label (e.g. "sign up now")                     │
 * ├──────────────────────────────────────────────────────────────┤
 * │ POST endpoint URL (hidden from display)                      │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Row 1 → heading
 * Row 2 → fine-print paragraph
 * Row 3 → button label (optional, defaults to "sign up now")
 * Row 4 → POST endpoint (optional, defaults to submitting to /newsletter)
 *
 * On success a confirmation message replaces the form.
 */

const DEFAULT_ENDPOINT = '/newsletter';
const DEFAULT_BTN_LABEL = 'sign up now';

function showConfirmation(form) {
  const msg = document.createElement('p');
  msg.classList.add('newsletter-confirmation');
  msg.textContent = 'Thank you for signing up!';
  form.replaceWith(msg);
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const getText = (row) => (row ? row.querySelector(':scope > div')?.innerHTML.trim() || '' : '');

  const headingHTML = getText(rows[0]);
  const finePrintHTML = getText(rows[1]);
  const btnLabel = rows[2]?.textContent?.trim() || DEFAULT_BTN_LABEL;
  const endpoint = rows[3]?.textContent?.trim() || DEFAULT_ENDPOINT;

  // Clear block content and rebuild
  block.innerHTML = '';

  if (headingHTML) {
    const heading = document.createElement('h2');
    heading.classList.add('newsletter-heading');
    heading.innerHTML = headingHTML;
    block.append(heading);
  }

  const form = document.createElement('div');
  form.classList.add('newsletter-form');
  form.setAttribute('role', 'form');

  // Email field
  const fieldWrap = document.createElement('div');
  fieldWrap.classList.add('newsletter-field');

  const label = document.createElement('label');
  label.setAttribute('for', 'newsletter-email');
  label.textContent = 'email address (required)';
  label.classList.add('newsletter-label');

  const input = document.createElement('input');
  input.type = 'email';
  input.id = 'newsletter-email';
  input.name = 'email';
  input.required = true;
  input.placeholder = 'your@email.com';
  input.classList.add('newsletter-input');
  input.autocomplete = 'email';

  fieldWrap.append(label, input);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.classList.add('newsletter-submit', 'button', 'primary');
  submitBtn.textContent = btnLabel;

  form.append(fieldWrap, submitBtn);

  if (finePrintHTML) {
    const fine = document.createElement('p');
    fine.classList.add('newsletter-fine-print');
    fine.innerHTML = finePrintHTML;
    form.append(fine);
  }

  // Submit handler
  submitBtn.addEventListener('click', async () => {
    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'sending…';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value }),
      });

      if (res.ok) {
        showConfirmation(form);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = btnLabel;
        // Surface server error inline
        let errMsg = block.querySelector('.newsletter-error');
        if (!errMsg) {
          errMsg = document.createElement('p');
          errMsg.classList.add('newsletter-error');
          form.insertBefore(errMsg, submitBtn);
        }
        errMsg.textContent = 'Something went wrong. Please try again.';
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = btnLabel;
    }
  });

  block.append(form);
}
