/**
 * [claude] Application entry point and initialization.
 *
 * Changes from the original:
 *  - Import getMarkerIcons function from globals to initialize
 *    icons lazily after Leaflet is loaded
 *  - Added JSDoc and comments
 *  - Layout hash parsing now handles the 'theme' param
 *  - Initialisation flow: tweakUrl → parse URL → restore layout
 *    state → load initial data → register listeners
 */

import { $ } from './base.js';
import { updateSearchPlaceHolder, qs2form, form2qs } from './utils.js';
import { getResource } from './querier.js';
import { addListeners, showTooltip, hideTooltip } from './listeners.js';
import { initAdvSearch } from './adv-search.js';
import { initializeMap } from './mapping/index.js';
import { renderYearlyCountsSparkline } from './renderers.js';
import { globals, getMarkerIcons } from './globals.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * [claude] Resolves Zenodeo and map URIs based on the current
 * hostname. Falls back to 'localhost' when the hostname is not
 * explicitly configured in globals.env.
 *
 * After this function runs, all Ocellus module can safely use
 * window.Ocellus.uris.* to reference the resolved endpoints.
 *
 * @param {string} [hostname=window.location.hostname]
 */
function tweakUrl(hostname = window.location.hostname) {
    const env = globals.env[hostname] ?? globals.env['localhost'];
    window.Ocellus = window.Ocellus || {};

    window.Ocellus.uris = {
        zenodo:        'https://zenodo.org',
        treatmentBank: 'https://tb.plazi.org/GgServer/html',
        ...env
    };

    // [claude] Initialise Leaflet marker icons now that Leaflet
    // is available
    window.Ocellus.markerIcons = getMarkerIcons();
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * [claude] Application initialization: reads URL state, restores
 * the search form from query string and layout hash, loads initial
 * data, and registers all event listeners.
 *
 * Called once when the DOM is ready.
 */
function init() {
    tweakUrl();

    // [claude] Expose tooltip functions globally so they can
    // be called from inline event handlers in the sparkline SVG
    window.showTooltip = showTooltip;
    window.hideTooltip = hideTooltip;

    const loc = new URL(location);

    // [claude] Parse the hash fragment for layout state
    // (layout, image size, theme)
    if (loc.hash) {
        const hashParams = new URLSearchParams(
            loc.hash.substring(1)
        );

        const layout = hashParams.get('layout');
        const img = hashParams.get('img');
        const theme = hashParams.get('theme');

        if (layout) {
            const layoutInput = $('input[name=layout]');
            if (layoutInput) layoutInput.value = layout;

            const layoutToggle = $('input[name=layout-toggle]');
            if (layoutToggle) layoutToggle.checked = (layout === 'pg');
        }

        if (img) {
            const imgInput = $('input[name=img]');

            if (imgInput) imgInput.value = img;
        }

        if (theme) globals.results.activeTheme = theme;

        const themeCycleBtn = $('#theme-cycle');

        if (themeCycleBtn) {
            themeCycleBtn.innerText = `theme: ${globals.results.activeTheme}`;
        }
    }

    // [claude] Parse the query string for search parameters
    if (loc.search) {

        log.info(`- locSearch: ${loc.search.substring(1)}`);
        qs2form(loc.search.substring(1));
        const queryString = form2qs();
        getResource(queryString);
    }
    else {
        const resource = 'images';
        updateSearchPlaceHolder(resource);
        renderYearlyCountsSparkline(resource);
    }

    addListeners();
    initAdvSearch();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export { init, initializeMap, showTooltip, hideTooltip };
