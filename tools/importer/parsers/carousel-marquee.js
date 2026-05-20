/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-marquee
 * Base block: carousel
 * Source: https://www.mms.com/en-us
 * Generated: 2026-05-19
 *
 * Parses a horizontally scrolling text marquee/ticker containing keywords
 * separated by ampersands. The source DOM repeats keywords for infinite scroll
 * effect, so this parser deduplicates them to extract unique keyword sets per row.
 *
 * Source structure:
 *   div.css-ko3u0t (marquee container - this is the element received)
 *     div.css-kte5ue (row 1 - scrolling line)
 *       span.MuiTypography-h1BigLightSerif (keyword)
 *       span.MuiTypography-h2BoldSerif (&)
 *       ... (repeating pattern for infinite scroll)
 *     div.css-kte5ue (row 2 - scrolling line)
 *       ... (same pattern, different keywords)
 *
 * Target block table:
 *   | carousel-marquee |
 *   | --- |
 *   | diploma & cap & gown & congratulations & celebration |
 *   | graduate & degree & honors & party & achievement |
 */
export default function parse(element, { document }) {
  // Element is the marquee container div (div.css-ko3u0t).
  // Each direct child div is a scrolling row with keyword spans.
  const rows = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];

  rows.forEach((row) => {
    const cellContent = extractUniqueKeywords(row, document);
    if (cellContent.length > 0) {
      cells.push(cellContent);
    }
  });

  // Fallback: if no rows found via direct children, try any divs containing keyword spans
  if (cells.length === 0) {
    const fallbackRows = Array.from(
      element.querySelectorAll('div:has(> .MuiTypography-h1BigLightSerif)')
    );
    fallbackRows.forEach((row) => {
      const cellContent = extractUniqueKeywords(row, document);
      if (cellContent.length > 0) {
        cells.push(cellContent);
      }
    });
  }

  // Final fallback: extract all keywords as one row
  if (cells.length === 0) {
    const allSpans = Array.from(
      element.querySelectorAll('.MuiTypography-h1BigLightSerif, [class*="h1BigLightSerif"]')
    );
    if (allSpans.length > 0) {
      const allKeywords = allSpans.map((s) => s.textContent.trim()).filter(Boolean);
      const unique = deduplicatePattern(allKeywords);
      const p = document.createElement('p');
      p.textContent = unique.join(' & ');
      cells.push([p]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-marquee', cells });
  element.replaceWith(block);
}

/**
 * Extracts unique keywords from a marquee row, deduplicating the repeating
 * pattern used for infinite scroll effect. Returns an array with a single
 * paragraph element containing "keyword1 & keyword2 & ..." text.
 */
function extractUniqueKeywords(row, document) {
  if (!row) return [];

  // Get all keyword spans (not the ampersand separators)
  const keywordSpans = Array.from(
    row.querySelectorAll('.MuiTypography-h1BigLightSerif, [class*="h1BigLightSerif"]')
  );

  if (keywordSpans.length === 0) {
    // Fallback: try all spans that are not ampersand separators
    const allSpans = Array.from(row.querySelectorAll('span'));
    const nonAmpSpans = allSpans.filter((s) => s.textContent.trim() !== '&');
    if (nonAmpSpans.length === 0) return [];
    return buildKeywordCell(nonAmpSpans, document);
  }

  return buildKeywordCell(keywordSpans, document);
}

/**
 * Given an array of keyword span elements, deduplicates and builds a cell
 * containing a paragraph with the keywords joined by " & ".
 */
function buildKeywordCell(spans, document) {
  const allKeywords = spans.map((s) => s.textContent.trim()).filter(Boolean);
  const uniqueKeywords = deduplicatePattern(allKeywords);

  if (uniqueKeywords.length === 0) return [];

  const p = document.createElement('p');
  p.textContent = uniqueKeywords.join(' & ');

  return [p];
}

/**
 * Finds the shortest repeating subsequence in an array of keywords.
 * e.g. [a,b,c,a,b,c,a,b,c] -> [a,b,c]
 */
function deduplicatePattern(keywords) {
  if (keywords.length === 0) return [];

  // Try pattern lengths from 1 up to half the array
  for (let patternLen = 1; patternLen <= Math.floor(keywords.length / 2); patternLen++) {
    if (keywords.length % patternLen !== 0) continue;

    const pattern = keywords.slice(0, patternLen);
    let isRepeating = true;

    for (let i = patternLen; i < keywords.length; i++) {
      if (keywords[i] !== pattern[i % patternLen]) {
        isRepeating = false;
        break;
      }
    }

    if (isRepeating) return pattern;
  }

  // No repeating pattern found; return all keywords as-is
  return keywords;
}
