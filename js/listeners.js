/**
 * [claude] Event listener setup and handlers.
 *
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
import { initializeMap } from './mapping/index.js';
import { renderYearlyCountsSparkline } from './renderers.js';
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
 * [claude] Submits the search form: serialises it to a query
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

    // [claude] Push the query string to history, then fetch
    updateUrl(qs);

    getResource(qs);
}

// ---------------------------------------------------------------------------
// Event listener registration
// ---------------------------------------------------------------------------

/**
 * [claude] Registers all event listeners on the search form,
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

    // [claude] Grid-size adjust buttons
    $('#gridsize-plus').addEventListener(
        'click',
        () => adjustGridSize(25)
    );
    $('#gridsize-minus').addEventListener(
        'click',
        () => adjustGridSize(-25)
    );

    // [claude] Theme cycle button
    const themeCycleBtn = $('#theme-cycle');

    if (themeCycleBtn) {
        themeCycleBtn.addEventListener(
            'click', cycleTheme
        );
    }

    // [claude] Theme aspect-ratio cycle button
    const themeAspectBtn = $('#theme-aspect-cycle');

    if (themeAspectBtn) {
        themeAspectBtn.addEventListener(
            'click', cycleThemeAspect
        );
    }

    // [claude] Layout settings gear-menu toggle
    const layoutSettingsBtn = $('#layout-settings-toggle');

    if (layoutSettingsBtn) {
        layoutSettingsBtn.addEventListener(
            'click', toggleLayoutMenu
        );
    }

    // [claude] Modal toggles and other UI elements
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

    // [claude] Global keyboard shortcut: '/' focuses the search input
    document.addEventListener('keydown', focusOnSearch);
};

// ---------------------------------------------------------------------------
// Search handlers
// ---------------------------------------------------------------------------

/**
 * [claude] Executes a quick-search: populates the search form
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
 * [claude] Global keyboard shortcut handler: '/' focuses the
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
 * [claude] Toggles the examples/help panel visibility.
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
 * [claude] Clears the 'required' validation class from a date
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

/**
 * [claude] Toggles the advanced-search panel visibility and
 * updates form input focus. Also initializes a map for
 * geolocation drawing when advanced search is activated.
 * @param {Event} [e]
 */
const toggleAdvSearch = (e) => {

    log.info('- toggling advanced search');

    $('#as-container').classList.toggle('noblock');

    const advSearchIsActive =
        $('input[name=searchtype]').checked;

    if (advSearchIsActive) {
        $('#q').value = '';
        $('#q').placeholder = 'use advanced search below';
        $('#q').disabled = true;
        $('#refreshCache').disabled = true;
        $('#clear-q').disabled = true;
        $('input[name="as-q"]').focus();

        initializeMap({
            mapContainer: 'mapSearch',
            baseLayerSource: 'geodeo',
            drawControl: true
        });
    }
    else {
        $('#q').placeholder = globals.defaultPlaceholder;
        $('#q').disabled = false;
        $('#refreshCache').disabled = false;
        $('#clear-q').disabled = false;
    }
};

// ---------------------------------------------------------------------------
// Resource toggle
// ---------------------------------------------------------------------------

/**
 * [claude] Updates the placeholder text and yearly-counts chart
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
 * [claude] Toggles between default and photogrid layouts.
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
 * [claude] Shows/hides the 'from' and 'to' date inputs when
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
 * [claude] Handles the normal search 'Go' button:
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
 * [claude] Handles the advanced search 'Go' button:
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
 * [claude] Toggles modal visibility: closes all open modals
 * if a link with href="#modalId" is clicked, or closes all
 * if the close button (empty href) is clicked.
 * @param {Event} e
 */
const toggleModal = (e) => {
    const t = new URL(e.target.href).hash;
    const modals = $$('.modal');

    if (t.length > 0) {

        // [claude] Close all modals first
        modals.forEach(m => {
            m.classList.add(...globals.hiddenClasses);
        });

        // [claude] Open the targeted modal
        $(t).classList.remove(...globals.hiddenClasses);
    }
    else {

        // [claude] Close button: close all
        modals.forEach(m =>
            m.classList.add(...globals.hiddenClasses)
        );
    }
};

// ---------------------------------------------------------------------------
// Example insertion
// ---------------------------------------------------------------------------

/**
 * [claude] Inserts a clicked example into the search input
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
 * [claude] Shows a red placeholder when the user clicks the
 * 'Go' button with an empty search input.
 */
const promptForSearchTerm = () => {
    $('#q').placeholder = "c'mon, type something";
    $('#q').classList.add('red-placeholder');
};

/**
 * [claude] Resets the search input placeholder and clears the
 * 'refresh cache' checkbox.
 * @param {Event} [e]
 */
const resetPrompt = (e) => {
    $('#q').placeholder = globals.defaultPlaceholder;
    $('#q').classList.remove('red-placeholder');
    $('#refreshCache').checked = false;
};

/**
 * [claude] Toggles the refresh-cache popover when the
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
 * [claude] Allows only one <details> element to be open at a
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
// Figure and carousel handlers
// ---------------------------------------------------------------------------

/**
 * [claude] Adds toggle handlers to figure captions: expands
 * and truncates the title when toggled.
 */
const addListenersToFigDetails = () => {

    const figDetails = $$('figcaption > details');

    for (let i = 0, j = figDetails.length; i < j; i++) {

        figDetails[i].addEventListener('toggle', (event) => {

            const summary = event.target.querySelector('summary');
            const fullText = summary.dataset.title;
            const summaryText = fullText.length > 30
                ? `${fullText.substring(0, 30)}…`
                : fullText;

            summary.innerText = figDetails[i].open
                ? fullText
                : summaryText;
        });
    }
};

/**
 * [claude] Adds click handlers to image reveal buttons.
 */
const addListenersToFigureTypes = () => {

    const figtypes = $$('figure .reveal');

    for (let i = 0, j = figtypes.length; i < j; i++) {
        figtypes[i].addEventListener('click', reveal);
    }
};

/**
 * [claude] Sets up carousel navigation for each figure that
 * has geo data, including map initialisation on toggle.
 */
function addListenersToMapCarouselLink() {

    $$('.carouselbox').forEach(box => {

        if (!box.querySelector('.buttons')) {
            return;
        }

        carousel(box);
    });
}

/**
 * [claude] Initialises a carousel within a figure box.
 * @param {Element} box - The carouselbox element
 */
function carousel(box) {

    const toggle = box.querySelector('.toggle-checkbox');

    let counter = 0;
    const items = box.querySelectorAll('.slide');
    const amount = items.length;
    let current = items[0];

    toggle.addEventListener('click', function (event) {

        const tgt = event.currentTarget;
        const carouselbox = tgt.parentNode.parentNode.parentNode;

        setMapSize(carouselbox);
        navigate(1);
        drawMap(event);
    });

    navigate(0);

    function navigate(direction) {

        current.classList.remove('current');

        counter = counter + direction;

        if (direction === -1 && counter < 0) {
            counter = amount - 1;
        }

        if (direction === 1 && !items[counter]) {
            counter = 0;
        }

        current = items[counter];
        current.classList.add('current');
    }
}

/**
 * [claude] Sets the height of a mini-map to match its
 * carousel container.
 * @param {Element} carouselbox
 */
function setMapSize(carouselbox) {

    const height = carouselbox.clientHeight;
    const map = carouselbox.querySelector('.map');

    if (!map.style.height) {
        map.style.height = `${height - 28}px`;
    }
}

/**
 * [claude] Initialises and draws a mini-map for a figure's
 * location(s) or convex hull. Called when the user toggles
 * the map slide in a carousel.
 * @param {Event} event
 */
function drawMap(event) {

    const tgt = event.currentTarget;
    const id = tgt.dataset.id;
    const map = globals.maps[id];

    if (!map) {

        const newMap = L.map(`map-${id}`);
        globals.maps[id] = newMap;

        const mapSource =
            'http://services.arcgisonline.com/arcgis/rest/'
          + 'services/Canvas/World_Light_Gray_Base/'
          + 'MapServer/tile/{z}/{y}/{x}';

        L.tileLayer(mapSource, {
            maxZoom: 19,
            attribution:
                '&copy; <a href="'
              + 'http://www.openstreetmap.org/copyright">'
              + 'OpenStreetMap</a>'
        }).addTo(newMap);

        const mcIcon = L.icon({
            iconUrl: '../../img/treatment.svg',
            iconSize: [10, 10],
            iconAnchor: [5, 5]
        });

        let centroid;

        if (tgt.dataset.loc !== 'undefined') {

            const loc = JSON.parse(tgt.dataset.loc);
            const points = loc.map(point =>
                [point.latitude, point.longitude]
            );

            points.forEach((point, index) => {

                if (index === 0) {
                    centroid = point;
                }

                L.marker(point, { icon: mcIcon })
                    .addTo(newMap);
            });

            newMap.setView(centroid, 10);
        }
        else if (tgt.dataset.convexhull) {

            const convexhull =
                JSON.parse(tgt.dataset.convexhull);

            const polygon = L.polygon(
                convexhull,
                { color: '#9BC134', weight: 1 }
            ).addTo(newMap);

            convexhull.forEach((point, index) => {
                L.marker(point, { icon: mcIcon })
                    .addTo(newMap);
            });

            newMap.fitBounds(polygon.getBounds());
        }
    }
}

// ---------------------------------------------------------------------------
// Tooltips
// ---------------------------------------------------------------------------

/**
 * [claude] Shows a tooltip near the mouse position for sparkline
 * bars on hover.
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
 * [claude] Hides the sparkline tooltip.
 */
function hideTooltip() {

    const sparkTip = $('#sparkTip');
    sparkTip.classList.remove('visible');
    sparkTip.classList.add('hidden');
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

/**
 * [claude] Initialises SimpleLightbox for all figures in the
 * search results.
 */
function lightUpTheBox() {

    new SimpleLightbox({
        elements: 'figure',
        loadingCaption: '<img src="../../img/bug.gif">'
    });
}

// ---------------------------------------------------------------------------
// Placeholder reveal (legacy)
// ---------------------------------------------------------------------------

/**
 * [claude] Placeholder for image reveal logic (currently unused,
 * preserved for backwards compatibility).
 */
function reveal() {
    // [claude] Placeholder: no implementation in original
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
    addListeners,
    addListenersToFigDetails,
    addListenersToFigureTypes,
    addListenersToMapCarouselLink,
    toggleResource,
    toggleLayout,
    toggleAdvSearch,
    toggleDateSelector,
    showTooltip,
    hideTooltip,
    toggleModal,
    lightUpTheBox
};
