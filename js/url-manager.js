/**
 * [claude] Unified URL and browser-history manager.
 *
 * Previously, URL state was written in two places with subtly
 * different hash formats:
 *   - updateUrl() in utils.js  (called after form submission)
 *   - syncFormInputsAndHash() in listeners.js (called on layout
 *     toggle without re-fetching)
 *
 * The hash produced by the first form omitted the theme; the
 * second included it. This module provides a single canonical
 * format:
 *
 *   ?<query-string>#layout=pg&img=<size>&theme=<name>
 *
 * When layout is not 'pg', the hash is omitted entirely.
 */

import { $ }       from './base.js';
import { globals } from './globals.js';

/**
 * [claude] Builds the hash fragment that encodes photogrid layout
 * state. Returns an empty string when layout is not 'pg', so the
 * URL is left clean for normal searches.
 * @param {boolean} isPg    - Whether photogrid layout is active
 * @param {number}  imgSize - Image size in pixels
 * @returns {string} Hash including leading '#', or ''
 */
function buildLayoutHash(isPg, imgSize) {

    if (!isPg) return '';

    const theme = globals.results.activeTheme;
    return `#layout=pg&img=${imgSize}&theme=${theme}`;
}

/**
 * [claude] Keeps the two hidden form inputs (<input name="layout">
 * and <input name="img">) in sync with the active layout state.
 * These inputs are read by form2qs() when serialising the form,
 * so they must always reflect the current visual state.
 * @param {boolean} isPg    - Whether photogrid layout is active
 * @param {number}  imgSize - Image size in pixels
 */
function syncHiddenInputs(isPg, imgSize) {

    const layoutInput = $('input[name=layout]');
    const imgInput    = $('input[name=img]');

    if (layoutInput) {
        layoutInput.value = isPg ? 'pg' : 'normal';
    }

    if (imgInput) {
        imgInput.value = isPg ? imgSize.toString() : '250';
    }
}

/**
 * [claude] Pushes a new browser-history entry that combines the
 * search query string with the current layout hash. Called after
 * any event that commits a new search (form submission).
 * @param {string}  qs      - Query string without leading '?'
 * @param {boolean} [isPg=false]  - Whether photogrid is active
 * @param {number}  [imgSize=250] - Image size in pixels
 */
export function updateUrl(qs, isPg = false, imgSize = 250) {

    const hash = buildLayoutHash(isPg, imgSize);
    history.pushState({}, '', `?${qs}${hash}`);
}

/**
 * [claude] Updates hidden form inputs and the browser URL to
 * reflect a layout change that happened client-side (no
 * re-fetch). Replaces the former syncFormInputsAndHash() in
 * listeners.js.
 * @param {boolean} isPg    - Whether photogrid layout is active
 * @param {number}  imgSize - Image size in pixels
 */
export function syncLayoutState(isPg, imgSize) {

    syncHiddenInputs(isPg, imgSize);

    const loc  = new URL(window.location);
    const hash = buildLayoutHash(isPg, imgSize);
    const newUrl = `${loc.pathname}${loc.search}${hash}`;
    window.history.pushState({}, '', newUrl);
}
