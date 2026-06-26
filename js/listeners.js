/**
 * Major refactoring from original:
 *  - All layout DOM manipulation (flipLayoutToPg,
 *    flipLayoutToDefault, adjustGridSize, cycleTheme,
 *    cycleThemeAspect, toggleLayoutMenu, fadeOutChartsContainer,
 *    syncFormInputsAndHash) moved to layout.js
 *  - Layout functions are now imported from layout.js where they
 *    belong, eliminating cross-file duplication
 *  - submitForm moved here from utils.js (was dead code there)
 *  - toggleWarn removed (moved to utils.js)
 *  - toggleSearch removed (dead — referenced non-existent DOM
 *    elements #fancySearch, #switchSearch-1, etc. that don't
 *    exist in index.html)
 *  - addListenersToPagerLinks removed (dead — was a no-op)
 *  - All remaining event handlers stay, restructured
 */

import { $, $$ }       from './base.js';
import { globals }     from './globals.js';
import {
    updateSearchPlaceHolder, qs2form,
    form2qs, toggleWarn
} from './utils.js';
import { Accordion }   from './accordion.js';
import { getResource } from './querier.js';
// initializeMap moved to figure-listeners.js (used by
// toggleAdvSearch there); no longer needed directly in listeners.js
// renderYearlyCountsSparkline moved to sparkline.js to
// break the renderers → querier → renderers circular dependency.
import { renderYearlyCountsSparkline } from './sparkline.js';
import {
    flipLayoutToPg, flipLayoutToDefault, adjustGridSize,
    cycleTheme, cycleThemeAspect, toggleLayoutMenu,
    resetLayoutMenuTimer
} from './layout.js';
import { updateUrl, syncLayoutState } from './url-manager.js';

// ---------------------------------------------------------------------------
// Form submission
// ---------------------------------------------------------------------------

/**
 * Submits the search form: serialises it to a query
 * string, updates the URL, and dispatches getResource() to fetch
 * and render results. Called by the 'Go' button (ns-go, as-go)
 * and the layout toggle.
 *
 * Moved here from utils.js where it was dead code (no other
 * module imported it).
 */
function submitForm() {

    const qs = form2qs();

    if (qs === false) return;

    // Push the query string to history, then fetch
    updateUrl(qs);

    getResource(qs);
}

// ---------------------------------------------------------------------------
// Event listener registration
// ---------------------------------------------------------------------------

/**
 * Registers all event listeners on the search form,
 * layout controls, modals, and global keyboard shortcuts.
 * Called once at init time by ocellus.js.
 */
const addListeners = () => {

    log.info('- addListeners()');

    $('#refreshCache').addEventListener(
        'click', toggleRefreshCache
    );
    $('#ns-go').addEventListener('click', go);
    $('#as-go').addEventListener('click', asGo);
    $('#q').addEventListener('focus', resetPrompt);
    $('#search-help').addEventListener(
        'click', toggleExamples
    );
    $('div.examples').addEventListener(
        'toggle', controlDetails, true
    );
    $('input[name=searchtype]').addEventListener(
        'click', toggleAdvSearch
    );
    $('input[name=resource]').addEventListener(
        'click', toggleResource
    );
    $('input[name=layout-toggle]').addEventListener(
        'change', toggleLayout
    );
    $('select[name="as-publicationDate"]')
        .addEventListener('change', toggleDateSelector);

    $('select[name="as-checkinTime"]')
        .addEventListener('change', toggleDateSelector);

    // Grid-size adjust buttons
    $('#gridsize-plus').addEventListener(
        'click',
        () => adjustGridSize(25)
    );
    $('#gridsize-minus').addEventListener(
        'click',
        () => adjustGridSize(-25)
    );

    // Theme cycle button
    const themeCycleBtn = $('#theme-cycle');

    if (themeCycleBtn) {
        themeCycleBtn.addEventListener(
            'click', cycleTheme
        );
    }

    // Theme aspect-ratio cycle button
    const themeAspectBtn = $('#theme-aspect-cycle');

    if (themeAspectBtn) {
        themeAspectBtn.addEventListener(
            'click', cycleThemeAspect
        );
    }

    // Layout settings gear-menu toggle
    const layoutSettingsBtn = $('#layout-settings-toggle');

    if (layoutSettingsBtn) {
        layoutSettingsBtn.addEventListener(
            'click', toggleLayoutMenu
        );
    }

    // Modal toggles and other UI elements
    $$('.modalToggle').forEach(el =>
        el.addEventListener('click', toggleModal)
    );
    $$('.example-insert').forEach(el =>
        el.addEventListener('click', insertExample)
    );
    $$('input[type=date]').forEach(el =>
        el.addEventListener('change', resetDatePickerWarning)
    );
    $$('#charts-container').forEach(el =>
        new Accordion(el)
    );
    $$('a.quicksearch').forEach(el =>
        el.addEventListener('click', quickSearch)
    );

    // Global keyboard shortcut: '/' focuses the search input
    document.addEventListener('keydown', focusOnSearch);
};

// ---------------------------------------------------------------------------
// Search handlers
// ---------------------------------------------------------------------------

/**
 * Executes a quick-search: populates the search form
 * from a link URL and submits it.
 * @param {Event} event
 */
function quickSearch(event) {

    const resource = $('input[name=resource]').checked
        ? 'treatments'
        : 'images';

    const state = {};
    const title = '';
    const url = `${event.target.href}&resource=${resource}`;

    history.pushState(state, title, url);

    const loc = new URL(location);
    let qs;

    if (loc.search) {
        qs = loc.search.substring(1);
    }

    qs2form(qs);
    const queryString = form2qs();
    getResource(queryString);

    event.preventDefault();
    event.stopPropagation();
}

/**
 * Global keyboard shortcut handler: '/' focuses the
 * main search input and selects its text.
 * @param {KeyboardEvent} event
 */
function focusOnSearch(event) {

    if (event.key === '/') {

        if (/^(?:input|textarea|select|button)$/i
            .test(event.target.tagName)) {

            return;
        }

        const searchInput = $('#q');

        searchInput.setSelectionRange(
            0, searchInput.value.length
        );
        searchInput.focus();

        event.preventDefault();
    }
}

// ---------------------------------------------------------------------------
// Examples panel
// ---------------------------------------------------------------------------

/**
 * Toggles the examples/help panel visibility.
 * @param {Event} e
 */
const toggleExamples = (e) => {

    const cl = $('.examples').classList;

    if (cl.contains('hidden')) {
        cl.remove('hidden');
    }
    else {
        cl.add('hidden');
    }
};

/**
 * Clears the 'required' validation class from a date
 * picker when the user changes its value.
 * @param {Event} e
 */
const resetDatePickerWarning = (e) => {

    const cl = e.target.classList;

    if (cl.contains('required')) {
        cl.remove('required');
    }
};

// ---------------------------------------------------------------------------
// Advanced search
// ---------------------------------------------------------------------------

// toggleAdvSearch moved to figure-listeners.js so
// querier.js can call it without importing from listeners.js
// (which would create a querier → listeners → querier cycle).
// Imported here for local use in addListeners(), and re-exported
// below to preserve the listeners.js public API.
import { toggleAdvSearch } from './figure-listeners.js';
export { toggleAdvSearch } from './figure-listeners.js';

// ---------------------------------------------------------------------------
// Resource toggle
// ---------------------------------------------------------------------------

/**
 * Updates the placeholder text and yearly-counts chart
 * when the user toggles between 'images' and 'treatments'.
 * @param {Event} e
 */
const toggleResource = (e) => {

    const resource = $('input[name=resource]').checked
        ? 'treatments'
        : 'images';

    updateSearchPlaceHolder(resource);
    renderYearlyCountsSparkline(resource);
};

// ---------------------------------------------------------------------------
// Layout toggle
// ---------------------------------------------------------------------------

/**
 * Toggles between default and photogrid layouts.
 * On first photogrid request, submits the form to fetch results
 * in photogrid size. On subsequent toggles, flips client-side
 * without re-fetching.
 * @param {Event} e
 */
const toggleLayout = (e) => {

    resetLayoutMenuTimer();

    const isChecked = e.target.checked;
    const themeSettings = $('#theme-settings');

    if (isChecked) {
        if (themeSettings) {
            themeSettings.classList.remove('noblock');
            themeSettings.classList.add('inline-flex');
        }

        if (globals.results.photogridLoaded) {

            const imgInput = $('input[name=img]');
            const imgSize = imgInput
                ? parseInt(imgInput.value, 10) || 50
                : 50;

            flipLayoutToPg(imgSize);
            syncLayoutState(true, imgSize);

            
        }
        else {
            const resultCount = globals.results.totalCount || 0;
            const pgSize = Math.min(200, resultCount || 200);

            const layoutInput = $('input[name=layout]');
            const imgInput = $('input[name=img]');
            const sizeInput = $('input[name=size]');

            if (layoutInput) layoutInput.value = 'pg';
            if (imgInput) imgInput.value = '50';
            if (sizeInput) sizeInput.value = pgSize.toString();

            submitForm();
        }
    }
    else {

        if (themeSettings) {
            themeSettings.classList.add('noblock');
            themeSettings.classList.remove('inline-flex');
        }

        if (globals.results.photogridLoaded) {
            flipLayoutToDefault();
            syncLayoutState(false, 50);
        }
        else {
            const layoutInput = $('input[name=layout]');
            const imgInput = $('input[name=img]');

            if (layoutInput) layoutInput.value = 'normal';
            if (imgInput) imgInput.value = '250';

            submitForm();
        }
    }
};

// ---------------------------------------------------------------------------
// Date selector
// ---------------------------------------------------------------------------

/**
 * Shows/hides the 'from' and 'to' date inputs when
 * the user selects 'between' in the date-range selector.
 * @param {Event} e
 */
const toggleDateSelector = (e) => {

    const srcName = e.target.name;

    if (e.target.value === 'between') {

        const tos = $$(`#${srcName}-range .hidden`);

        tos.forEach(t => {

            if (t.classList.contains('hidden')) {
                t.classList.remove('hidden');
                t.classList.add('vis');
            }
        });
    }
    else {

        const tos = $$(`#${srcName}-range .vis`);

        tos.forEach(t => {
            t.classList.add('hidden');
            t.classList.remove('vis');
        });
    }
};

// ---------------------------------------------------------------------------
// Form submission handlers
// ---------------------------------------------------------------------------

/**
 * Handles the normal search 'Go' button:
 * validates that a search term was entered, shows an error
 * message if not, otherwise submits the form.
 * @param {Event} e
 */
const go = (e) => {

    const q = $('#q').value;

    if (q === '') {
        promptForSearchTerm();
        setTimeout(resetPrompt, 4000);
    }
    else {
        $('#q').classList.remove('red-placeholder');
        $('#throbber').classList.remove('nothrob');
        $('#ns-go').classList.remove('glowing');

        submitForm();
    }

    e.stopPropagation();
    e.preventDefault();
};

/**
 * Handles the advanced search 'Go' button:
 * simply submits the form (validation is per-field).
 * @param {Event} e
 */
const asGo = (e) => {

    $('#throbber').classList.remove('nothrob');
    submitForm();

    e.stopPropagation();
    e.preventDefault();
};

// ---------------------------------------------------------------------------
// Modal handlers
// ---------------------------------------------------------------------------

/**
 * Toggles modal visibility: closes all open modals
 * if a link with href="#modalId" is clicked, or closes all
 * if the close button (empty href) is clicked.
 * @param {Event} e
 */
const toggleModal = (e) => {
    const t = new URL(e.target.href).hash;
    const modals = $$('.modal');

    if (t.length > 0) {

        // Close all modals first
        modals.forEach(m => {
            m.classList.add(...globals.hiddenClasses);
        });

        // Open the targeted modal
        $(t).classList.remove(...globals.hiddenClasses);
    }
    else {

        // Close button: close all
        modals.forEach(m =>
            m.classList.add(...globals.hiddenClasses)
        );
    }
};

// ---------------------------------------------------------------------------
// Example insertion
// ---------------------------------------------------------------------------

/**
 * Inserts a clicked example into the search input
 * and prepares to submit.
 * @param {Event} e
 */
const insertExample = (e) => {
    $('#q').value = e.target.textContent;
    $('#ns-go').classList.add('glowing');
    const sources = $$('input[name=source]');

    sources.forEach(s => {

        if (s.value === 'treatments') {
            s.checked = true;
        }

    });

    toggleExamples();

    e.stopPropagation();
    e.preventDefault();
};

// ---------------------------------------------------------------------------
// Search input prompting
// ---------------------------------------------------------------------------

/**
 * Shows a red placeholder when the user clicks the
 * 'Go' button with an empty search input.
 */
const promptForSearchTerm = () => {
    $('#q').placeholder = "c'mon, type something";
    $('#q').classList.add('red-placeholder');
};

/**
 * Resets the search input placeholder and clears the
 * 'refresh cache' checkbox.
 * @param {Event} [e]
 */
const resetPrompt = (e) => {
    $('#q').placeholder = globals.defaultPlaceholder;
    $('#q').classList.remove('red-placeholder');
    $('#refreshCache').checked = false;
};

/**
 * Toggles the refresh-cache popover when the
 * checkbox is clicked.
 * @param {Event} e
 */
const toggleRefreshCache = (e) => {
    $('#refreshCache').toggleAttribute('data-pop-show');
};

// ---------------------------------------------------------------------------
// Details / accordion
// ---------------------------------------------------------------------------

/**
 * Allows only one <details> element to be open at a
 * time in the examples panel (mutual-exclusion accordion).
 * https://gomakethings.com/
 * only-allowing-one-open-dropdown-at-a-time-with-the-details-element/
 * @param {Event} e
 */
const controlDetails = (e) => {
    if (!e.target.open) return;
    const details = $$('details[open]');

    Array.prototype.forEach.call(details, function (detail) {
        if (detail === e.target) return;
        detail.removeAttribute('open');
    });
};

// ---------------------------------------------------------------------------
// Figure and carousel handlers — delegated to figure-listeners.js
// ---------------------------------------------------------------------------
// These functions were moved to figure-listeners.js so that
// querier.js can import them without creating a new
// querier → listeners → querier cycle (listeners.js imports
// getResource from querier.js). The implementations live in
// figure-listeners.js; this re-export keeps the public API of
// listeners.js unchanged for any existing external callers.
export {
    addListenersToFigDetails,
    addListenersToFigureTypes,
    addListenersToMapCarouselLink,
    lightUpTheBox
} from './figure-listeners.js';

// ---------------------------------------------------------------------------
// Tooltips
// ---------------------------------------------------------------------------

/**
 * Shows a tooltip near the SVG sparkline bar that triggered the
 * mouseover event.
 * Called from inline onmouseover handlers in sparkline.js SVG
 * markup, so it must be exposed on window via ocellus.js.
 * @param {MouseEvent} evt
 * @param {string}     text
 */
function showTooltip(evt, text) {

    const sparkTip = $('#sparkTip');
    sparkTip.innerHTML = text;
    sparkTip.classList.remove('hidden');
    sparkTip.classList.add('visible');
}

/**
 * Hides the sparkline tooltip.
 * Also called from inline onmouseout handlers in sparkline.js SVG
 * markup and must be exposed on window via ocellus.js.
 */
function hideTooltip() {

    const sparkTip = $('#sparkTip');
    sparkTip.classList.remove('visible');
    sparkTip.classList.add('hidden');
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
// addListenersToFigDetails, addListenersToFigureTypes,
// addListenersToMapCarouselLink, lightUpTheBox, and toggleAdvSearch
// are re-exported above via named 'export … from' statements.
// Only symbols with local implementations are listed here.

export {
    addListeners,
    toggleResource,
    toggleLayout,
    toggleDateSelector,
    showTooltip,
    hideTooltip,
    toggleModal
};
