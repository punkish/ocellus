/**
 * Minimal DOM selector utilities — shorthand wrappers
 * around querySelector / querySelectorAll, keeping call-sites
 * concise without the weight of a full library.
 */

/**
 * Returns the first element matching the CSS selector,
 * or null when none exists.
 * @param {string} selector - CSS selector string
 * @returns {Element|null}
 */
const $ = selector => document.querySelector(selector);

/**
 * Returns a NodeList of all elements matching the
 * CSS selector.
 * @param {string} selector - CSS selector string
 * @returns {NodeList}
 */
const $$ = selector => document.querySelectorAll(selector);

export { $, $$ }