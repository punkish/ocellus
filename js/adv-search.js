/**
 * [claude] Advanced-search autocomplete initialization.
 * Populates dropdown suggestions for journal titles and
 * collection codes as the user types.
 *
 * Changes from the original:
 *  - Dead console.log statement removed from getDataFromZenodeo
 */

import { globals } from './globals.js';

// ---------------------------------------------------------------------------
// Zenodeo data fetching
// ---------------------------------------------------------------------------

/**
 * [claude] Fetches a paginated list from Zenodeo, caches it, and
 * returns an array of { display, value } objects ready for
 * autocomplete suggestions.
 *
 * @param {{ url: string, segment: string, display: string,
 *           value: string }} opts
 * @returns {Promise<Array<{ display: string, value: string }>>}
 */
async function getDataFromZenodeo({
    url, segment, display, value
}) {

    const resp = await fetch(url);

    if (resp.ok) {

        const { query, response } = await resp.json();

        if ('records' in response) {

            const records = response.records;

            if (records) {
                globals.cache[segment] = records.map(r => ({
                    display: r[display],
                    value:   r[value]
                }));
            }
        }

        return globals.cache[segment];
    }
    else {
        alert('HTTP-Error: ' + response.status);
    }
}

/**
 * [claude] Fetches the full list of collection codes from
 * Zenodeo.
 * @returns {Promise<Array>}
 */
async function getCollectionCodes() {

    return await getDataFromZenodeo({
        url:      `${window.Ocellus.uris.zenodeo}`
               + `/collectioncodes?cols=collectionCode`
               + `&cols=name&size=4300`,
        segment:  'collectionCodes',
        display:  'collectionCode',
        value:    'collectionCode'
    });
}

/**
 * [claude] Fetches the full list of journal titles from Zenodeo,
 * sorted alphabetically.
 * @returns {Promise<Array>}
 */
async function getJournalTitles() {

    return await getDataFromZenodeo({
        url:      `${window.Ocellus.uris.zenodeo}`
               + `/journals?size=1100`
               + `&sortby=journalTitle:asc`,
        segment:  'journals',
        display:  'journalTitle',
        value:    'journalTitle'
    });
}

// ---------------------------------------------------------------------------
// Autocomplete
// ---------------------------------------------------------------------------

/**
 * [claude] Initialises an autoComplete widget on an input field.
 * As the user types, matching options from a callback are
 * suggested below the input.
 *
 * @param {{ selector: string, minChars: number, cb: Function,
 *           display: string, value: string }} opts
 * @returns {autoComplete} The autoComplete instance
 */
function makeAutoComplete({
    selector, minChars, cb, display, value
}) {

    log.info(
        `- makeAutoComplete()\n`
      + `  - selector: ${selector}\n`
      + `  - minChars: ${minChars}\n`
      + `  - cb: ${cb}\n`
      + `  - display: ${display}\n`
      + `  - value: ${value}`
    );

    return new autoComplete({

        selector,

        minChars,

        /**
         * [claude] Fetches the full list of choices via the
         * callback, filters by the user's term, and returns
         * matching objects.
         * @param {string} term    - User-typed search term
         * @param {Function} suggest - Callback to display results
         */
        source: async function (term, suggest) {

            term = term.toLowerCase();

            const choices = await cb();
            const matches = [];

            for (let i = 0; i < choices.length; i++) {

                if (~choices[i].display
                    .toLowerCase()
                    .indexOf(term)) {

                    matches.push({
                        display: choices[i].display,
                        value:   choices[i].value
                    });
                }
            }

            suggest(matches);
        },

        /**
         * [claude] Renders each suggestion item with the matched
         * text bolded.
         * @param {Object} item   - The { display, value } object
         * @param {string} search - The search term
         * @returns {string} HTML for the suggestion
         */
        renderItem: function (item, search) {

            const escaped = search
                .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

            const re = new RegExp(
                `(${escaped.split(' ').join('|')})`, 'gi'
            );

            const disp = item.display.replace(re, '<b>$1</b>');

            return `<div class="autocomplete-suggestion"`
                 + ` data-id="${item.value}">`
                 + `${disp}</div>`;
        },

        /**
         * [claude] Populates the input field with the selected
         * suggestion's value.
         * @param {Event} e    - The click event
         * @param {string} term - The search term
         * @param {Element} item - The suggestion element
         */
        onSelect: function (e, term, item) {

            document.querySelector(selector).value =
                item.getAttribute('data-id');
        }
    });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * [claude] Initialises autocomplete on journal-title and
 * collection-code inputs in the advanced-search form.
 * Called once at init time by ocellus.js.
 */
function initAdvSearch() {

    log.info('- initAdvSearch()');

    makeAutoComplete({
        selector: 'input[name="as-journalTitle"]',
        minChars: 2,
        cb:       getJournalTitles,
        display:  'journalTitle',
        value:    'journalTitle'
    });

    makeAutoComplete({
        selector: 'input[name="as-collectionCode"]',
        minChars: 2,
        cb:       getCollectionCodes,
        display:  'collectionCode',
        value:    'collectionCode'
    });
}

export { initAdvSearch };
