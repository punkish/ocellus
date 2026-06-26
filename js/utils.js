/**
 * General-purpose utilities: form serialisation, URL
 * updates, display helpers, and the warn banner.
 *
 * Changes from the original:
 *  - smoke() removed (dead — referenced undefined globals sel_puff
 *    and hidden, was never called)
 *  - getCountOfResource import removed (was unused in this module)
 *  - submitForm() moved to listeners.js so this module no longer
 *    needs to import from querier.js, breaking a circular dependency
 *  - toggleWarn() moved here from listeners.js so querier.js can
 *    import it without importing from listeners.js
 *  - submitFlag inner-scope shadow in form2qs() fixed
 *  - updateUrl() superseded by url-manager.js; still exported here
 *    as a thin re-export for backwards compatibility with any caller
 *    that hasn't migrated yet
 */

import { $, $$ }         from './base.js';
import { globals }       from './globals.js';
import { updateUrl }     from './url-manager.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Formats a log message with indentation matching the
 * given nesting level. Used to make the log output readable when
 * functions call each other several levels deep.
 * @param {string} msg   - Message text
 * @param {number} level - Indent level (1, 2, or 3)
 * @returns {string}
 */
function formatLog(msg, level) {

    if (level === 1) return `- ${msg}`;
    if (level === 2) return `  ${msg}`;

    return `    ${msg}`;
}

// ---------------------------------------------------------------------------
// Warn banner
// ---------------------------------------------------------------------------

/**
 * Displays a transient warning banner for 3 seconds.
 * Moved here from listeners.js so that querier.js can import it
 * without creating a querier → listeners circular dependency.
 * Only shows if the banner is currently hidden (prevents stacking).
 * @param {string} msg - HTML-safe message to display
 */
export function toggleWarn(msg) {

    const warn = $('.warn');

    if (warn.classList.contains('hidden')) {
        warn.innerHTML = msg;
        warn.classList.remove('hidden');
        $('#throbber').classList.add('nothrob');

        setTimeout(() => {
            warn.innerHTML = '';
            warn.classList.add('hidden');
        }, 3000);
    }
}

// ---------------------------------------------------------------------------
// Query string ↔ form synchronisation
// ---------------------------------------------------------------------------

/**
 * Populates the search form from a URL query string.
 * Fills the plain-text 'q' input with all params that aren't
 * routing/pagination params (notValidQ), and sets the resource
 * toggle and hidden inputs for params that are.
 *
 * 'refreshCache' is intentionally stripped before processing so
 * it is never persisted in a bookmarked URL.
 *
 * @param {string} qs - Raw query string (without leading '?')
 */
export function qs2form(qs) {

    log.info(formatLog(`qs2form(${qs})`, 1));

    const sp = new URLSearchParams(qs);

    // Never re-trigger a cache refresh from a bookmark
    sp.delete('refreshCache');

    const q = [];

    sp.forEach((val, key) => {
        log.info(formatLog(`key: "${key}", val: "${val}"`, 3));

        if (globals.params.notValidQ.includes(key)) {

            if (key === 'resource') {
                log.info(
                    formatLog(
                        `setting form to query resource "${val}"`,
                        3
                    )
                );
                updateSearchPlaceHolder(val);

                const checked = val === 'treatments';
                log.info(
                    formatLog(
                        `setting toggle-resource to "${checked}"`,
                        3
                    )
                );
                $('input[name=resource]').checked = checked;
            }
            else {
                log.info(
                    formatLog(
                        `setting input name "${key}" to "${val}"`,
                        3
                    )
                );
                $(`input[name=${key}]`).value = val;
            }
        }
        else {
            log.info(formatLog(`building value of "q"`, 3));

            // Default is to use the key itself as the
            // token when there is no value (e.g. bare 'phylogeny')
            let value = key;

            if (val) {
                value = key === 'q'
                    ? decodeURIComponent(val)
                    : `${key}=${val}`;
            }

            q.push(value);
        }
    });

    $('#q').value = q.join('&');
}

/**
 * Serialises the search form into a URL query string.
 * Handles three input categories differently:
 *   1. Simple search ('ss'): reads input.query elements + the 'q'
 *      text field, auto-detecting DOI patterns
 *   2. Advanced search ('as'): reads the 'as-*' prefixed inputs
 *      and converts them to Zenodeo filter syntax (e.g. eq(...))
 *
 * Returns false (not an empty string) when validation fails so
 * callers can distinguish "nothing to submit" from "submit blocked".
 *
 * @returns {string|false} Query string, or false on validation fail
 */
export function form2qs() {

    log.info(formatLog('form2qs()', 1));

    const sp = new URLSearchParams();

    const searchtypeToggle = $('input[name=searchtype');
    const typeOfSearch = searchtypeToggle.checked ? 'as' : 'ss';

    // Outer flag: set to false by processSelectInputs()
    // when required date fields are empty. Declared once here;
    // the original code had an inner re-declaration inside
    // processSelectInputs that shadowed this variable, making the
    // date validation silently ineffective.
    let submitFlag = true;

    if (typeOfSearch === 'ss') {
        log.info(formatLog('simple search', 3));

        Array.from($$('form input.query'))
            .filter(i => i.value)
            .forEach(i => {
                let key = i.name;
                let val = i.value;

                if (key === 'q') {

                    // ' & ' (with spaces) appears in
                    // natural-language boolean queries and must be
                    // encoded before URLSearchParams parses them,
                    // otherwise it is treated as a key separator.
                    // See https://stackoverflow.com/q/77613064
                    const formVal = i.value
                        .replaceAll(/ & /g, '%20%26%20');

                    const spTmp = new URLSearchParams(formVal);

                    spTmp.forEach((v, k) => {

                        if (v === '') {

                            // A bare key with no value
                            // could be a DOI — detect and remap
                            const match = val.match(
                                /(^10\.[0-9]{4,}.*)/
                            );

                            if (match && match[1]) {
                                key = 'articleDOI';
                                val = match[1];
                            }
                            else {
                                key = 'q';
                                val = k;
                            }
                        }
                        else {
                            key = k;
                            val = v;
                        }

                        sp.append(key, val);
                    });
                }
                else {

                    if (i.type === 'radio' || i.type === 'checkbox') {

                        if (i.name === 'resource') {

                            // Resource is always emitted;
                            // unchecked means 'images' (the default)
                            if (i.checked || i.checked === 'true') {
                                sp.append(key, val);
                            }
                            else {
                                sp.append(key, 'images');
                            }
                        }
                        else {

                            if (i.checked || i.checked === 'true') {
                                sp.append(key, val);
                            }
                        }
                    }
                    else {
                        sp.append(key, val);
                    }
                }
            });
    }
    else if (typeOfSearch === 'as') {
        log.info(formatLog('advanced search', 3));

        // Common params are handled the same way in both
        // search modes; read them from the normal-search hidden
        // inputs rather than from the 'as-*' prefixed ones
        const commonInputs = [
            'page', 'size', 'resource', 'refreshCache'
        ];

        commonInputs.forEach(fldName => {
            const fld = $(`input[name=${fldName}]`);

            if (fldName === 'resource') {

                if (fld.checked || fld.checked === 'true') {
                    sp.append(fldName, fld.value);
                }
                else {
                    sp.append(fldName, 'images');
                }
            }
            else {

                if (fld.checked || fld.checked === 'true') {
                    sp.append(fldName, fld.value);
                }
            }
        });

        const textInputs = [
            'q', 'treatmentTitle', 'authorityName',
            'articleTitle', 'journalTitle', 'collectionCode'
        ];

        textInputs.forEach(fldName => {
            const fld = $(`input[name="as-${fldName}"]`);

            if (fld.value) {

                // eq() forces an exact SQL match rather
                // than the default LIKE/FTS behaviour
                sp.append(fldName, `eq(${fld.value})`);
            }
        });

        const status = $(`input[name="as-status"]`);

        if (status.checked || status.checked === 'true') {
            sp.append('status', `eq(${status.value})`);
        }

        const refreshCache = $(`input[name="as-refreshCache"]`);

        if (
            refreshCache.checked ||
            refreshCache.checked === 'true'
        ) {
            sp.append('refreshCache', refreshCache.value);
        }

        const selectInputs = [
            'journalYear',
            'publicationDate',
            'checkinTime',
            'biome',
        ];

        /**
         * Reads one select input and appends the
         * corresponding Zenodeo filter expression to sp.
         * Returns false when required date fields are empty
         * (setting submitFlag to false in the outer scope), or
         * true when the field was valid or blank.
         * @param {string} fldName - Field name without 'as-' prefix
         * @returns {boolean}
         */
        function processSelectInputs(fldName) {

            const op    = $(`select[name="as-${fldName}"]`);
            const i     = op.selectedIndex;
            const opVal = op.options[i].value;

            if (!opVal) return true;

            if (fldName === 'journalYear' || fldName === 'biome') {
                sp.append(fldName, opVal);
                return true;
            }

            if (opVal === 'between') {
                const fromEl = $(
                    `input[name="as-${fldName}From`
                );
                const toEl = $(
                    `input[name="as-${fldName}To`
                );
                const valFrom = fromEl.value;
                const valTo   = toEl.value;

                if (valFrom && valTo) {
                    sp.append(
                        fldName,
                        `between(${valFrom} and ${valTo})`
                    );
                    return true;
                }

                // Mark empty required fields and block
                // submission by setting the outer submitFlag
                if (!valFrom) fromEl.classList.add('required');
                if (!valTo)   toEl.classList.add('required');
                submitFlag = false;
                return false;
            }

            // Handles eq, since, until operators
            const inp = $(`input[name="as-${fldName}From`);
            const val = inp.value;

            if (val) {
                sp.append(fldName, `${opVal}(${val})`);
                return true;
            }

            inp.classList.add('required');
            submitFlag = false;
            return false;
        }

        for (const i of selectInputs) {

            if (!processSelectInputs(i)) break;
        }

        const geolocFld = $(`input[name="as-geolocation"]`);

        if (geolocFld && geolocFld.value) {
            sp.append('geolocation', geolocFld.value);
        }
    }

    if (!submitFlag) return false;

    return sp.toString();
}

// ---------------------------------------------------------------------------
// Placeholder and display helpers
// ---------------------------------------------------------------------------

/**
 * Updates the placeholder text of the main 'q' input to
 * reflect the currently selected resource type.
 * @param {string} resource - 'images' or 'treatments'
 */
export function updateSearchPlaceHolder(resource) {
    log.info(
        formatLog(
            `updateSearchPlaceHolder("${resource}")`,
            1
        )
    );
    $('#q').placeholder = `search ${resource}`;
}

// ---------------------------------------------------------------------------
// Number and date formatters
// ---------------------------------------------------------------------------

/**
 * Appends the correct English ordinal suffix to an integer
 * (1st, 2nd, 3rd, 4th…). Returns the value unchanged if it is not
 * a whole number. https://stackoverflow.com/a/15810761
 * @param {number} n
 * @returns {string|number}
 */
export function nth(n) {

    log.info(formatLog(`nth(${n})`, 1));

    if (isNaN(n) || n % 1) return n;

    const s = n % 100;

    if (s > 3 && s < 21) return `${n}th`;

    switch (s % 10) {
        case 1:  return `${n}st`;
        case 2:  return `${n}nd`;
        case 3:  return `${n}rd`;
        default: return `${n}th`;
    }
}

/**
 * Spells out single-digit numbers in lower-case English
 * (1 → 'one', 9 → 'nine'). Returns the number itself for 10+.
 * @param {number} n
 * @returns {string|number}
 */
export function niceNumbers(n) {

    log.info(formatLog(`niceNumbers(${n})`, 1));

    const nice = [
        'One', 'Two', 'Three', 'Four', 'Five',
        'Six', 'Seven', 'Eight', 'Nine'
    ];

    return n < 10 ? nice[n - 1].toLowerCase() : n;
}

/**
 * Converts milliseconds to a human-readable string in the
 * form "D days HH hours MM mins". https://stackoverflow.com/a/8528531
 * @param {number} ms - Duration in milliseconds
 * @returns {string}
 */
export function formatTime(ms) {

    log.info(formatLog(`formatTime(${ms})`, 1));

    const msInH = 60 * 60 * 1000;
    const msInD = 24 * msInH;
    let d = Math.floor(ms / msInD);
    let h = Math.floor((ms - d * msInD) / msInH);
    let m = Math.round(
        (ms - d * msInD - h * msInH) / 60000
    );

    const pad = n => n < 10 ? `0${n}` : n;

    if (m === 60) { h++; m = 0; }
    if (h === 24) { d++; h = 0; }

    return `${d} days ${pad(h)} hours ${pad(m)} mins`;
}

/**
 * Formats a Date object as "DD Month YYYY HH:MM:SS".
 * @param {Date} d
 * @returns {string}
 */
export function formatDate(d) {

    log.info(formatLog(`formatDate(${d})`, 1));

    const yyyy = d.getFullYear();
    const mm   = d.getMonth();
    const dd   = d.getDate();
    const hh   = d.getHours();
    const mn   = d.getMinutes();
    const ss   = d.getSeconds();

    return `${dd} ${globals.months[mm]}, ${yyyy} ${hh}:${mn}:${ss}`;
}

// ---------------------------------------------------------------------------
// Re-export updateUrl for callers that use it from utils.js
// ---------------------------------------------------------------------------
export { updateUrl };
