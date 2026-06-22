import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { 
    submitForm, updateSearchPlaceHolder, qs2form, form2qs 
} from './utils.js';
import { Accordion } from './accordion.js';
import { getResource } from './querier.js';
import { initializeMap } from './mapping/index.js';
import { renderYearlyCountsSparkline } from './renderers.js';

const addListeners = () => {
    log.info('- addListeners()');

    $('#refreshCache').addEventListener('click', toggleRefreshCache);
    $('#ns-go').addEventListener('click', go);
    $('#as-go').addEventListener('click', asGo);
    $('#q').addEventListener('focus', resetPrompt);
    $('#search-help').addEventListener('click', toggleExamples);
    $('div.examples').addEventListener('toggle', controlDetails, true);
    $('input[name=searchtype').addEventListener('click', toggleAdvSearch);
    $('input[name=resource').addEventListener('click', toggleResource);
    $('input[name=layout-toggle]').addEventListener('change', toggleLayout);
    $('select[name="as-publicationDate"]').addEventListener(
        'change', toggleDateSelector
    );
    $('select[name="as-checkinTime"]').addEventListener(
        'change', toggleDateSelector
    );

    // [gemini] Listeners for the grid size and theme cycle buttons
    $('#gridsize-plus').addEventListener('click', () => adjustGridSize(25));
    $('#gridsize-minus').addEventListener('click', () => adjustGridSize(-25));
    const themeCycleBtn = $('#theme-cycle');
    if (themeCycleBtn) {
        themeCycleBtn.addEventListener('click', cycleTheme);
    }

    const themeAspectBtn = $('#theme-aspect-cycle');
    if (themeAspectBtn) {
        themeAspectBtn.addEventListener('click', cycleThemeAspect);
    }

    const layoutSettingsBtn = $('#layout-settings-toggle');
    if (layoutSettingsBtn) {
        layoutSettingsBtn.addEventListener('click', toggleLayoutMenu);
    }

    $$('.modalToggle').forEach(el => el.addEventListener('click', toggleModal));
    $$('.example-insert').forEach(
        el => el.addEventListener('click', insertExample)
    );
    $$('input[type=date').forEach(
        el => el.addEventListener('change', resetDatePickerWarning)
    );
    $$('#charts-container').forEach(el => new Accordion(el));
    $$('a.quicksearch').forEach(
        (el) => el.addEventListener('click', quickSearch)
    );

    document.addEventListener('keydown', focusOnSearch);
}

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

// https://justincypret.com/blog/adding-a-keyboard-shortcut-for-global-search
function focusOnSearch(event) {
    if (event.key === '/') {
        if (/^(?:input|textarea|select|button)$/i.test(event.target.tagName)) {
            return;
        }

        const searchInput = $('#q');

        // Select the text in the input field
        searchInput.setSelectionRange(0, searchInput.value.length);

        // Focus on the search input
        searchInput.focus();

        // Prevent the default action of the '/' key
        event.preventDefault();
    }
}

const toggleExamples = (e) => {
    const cl = $('.examples').classList;

    if (cl.contains('hidden')) {
        cl.remove('hidden');
    }
    else {
        cl.add('hidden');
    }
}

const resetDatePickerWarning = (e) => {
    const cl = e.target.classList;

    if (cl.contains('required')) {
        cl.remove('required');
    }
}

const toggleWarn = (msg) => {
    if ($('.warn').classList.contains('hidden')) {
        $('.warn').innerHTML = msg;
        $('.warn').classList.remove('hidden');
        $('#throbber').classList.add('nothrob');
        setTimeout(() => {
            $('.warn').innerHTML = '';
            $('.warn').classList.add('hidden');
        }, 3000);
    }
}

const toggleAdvSearch = (e) => {
    log.info(('- toggling advanced search'));
    $('#as-container').classList.toggle('noblock');
    const advSearchIsActive = $('input[name=searchtype]').checked;

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

}

const toggleSearch = (e) => {
    $('#fancySearch').classList.toggle('hidden');
    $('#fancySearch').classList.toggle('noblock');
    $('#normalSearch').classList.toggle('hidden');
    $('#normalSearch').classList.toggle('noblock');

    const searchType = Array.from($$('input[name=searchType]'))
        .filter(i => i.checked)[0].value;

    // if event exists, the switch was clicked, so check the correct
    // switch and update the URL hash
    if (e) {
        if (e.target.dataset.checked === 'true') {
            const other = $('input[name=searchType][data-checked=false]');
            other.dataset.checked = true;
            other.checked = true;

            e.target.dataset.checked = 'false';
            e.target.checked = false;
        }
        else {
            const other = $('input[name=searchType][data-checked=true]');
            other.dataset.checked = false;
            other.checked = false;

            e.target.dataset.checked = 'true';
            e.target.checked = true;
        }

        const hash = searchType === 'fs'
            ? '#fs'
            : window.location.pathname;

        // https://stackoverflow.com/a/14690177
        if (history.pushState) {
            history.pushState(null, null, hash);
        }
        else {
            location.hash = hash;
        }

        // now, let's update the resource switch
        const arr = Array.from($$('input[name=resource]'));
        const checkedResource = arr.filter(i => i.checked)[0];

        const uncheckedTwin = arr
            .filter(i => !i.checked && (i.value === checkedResource.value))[0];

        checkedResource.checked = false;
        uncheckedTwin.checked = true;
    }

    // no event, so toggleSearch was called programmatically.
    // no need to update the URL, but the switch should be set.
    else {
        const searchTgt = searchType === 'ns'
            ? $('#switchSearch-1')
            : $('#switchSearch-2');

        searchTgt.checked = true;
    }
}

const toggleResource = (e) => {
    const resource = $('input[name=resource]').checked
        ? 'treatments'
        : 'images';

    // find the value of the checked source button inside 
    // the container div (cd) and set the source to that
    // value
    // const resource = Array.from($$('input[name=resource]'))
    //     .filter(i => i.checked)[0];
    updateSearchPlaceHolder(resource);
    renderYearlyCountsSparkline(resource);
}

// [gemini] Helper to sync layout hidden inputs and browser URL search and 
// hash params
const syncFormInputsAndHash = (isPg, imgSize) => {
    const layoutInput = $('input[name=layout]');
    const imgInput = $('input[name=img]');

    if (layoutInput) {
        layoutInput.value = isPg ? 'pg' : 'normal';
    }

    if (imgInput) {
        imgInput.value = isPg ? imgSize.toString() : '250';
    }

    const loc = new URL(window.location);
    const searchParams = loc.search;
    let newHash = '';

    if (isPg) {
        // [gemini] Include active theme in layout hash state
        newHash = `#layout=pg&img=${imgSize}&theme=${globals.results.activeTheme}`;
    }
    const newUrl = `${loc.pathname}${searchParams}${newHash}`;
    window.history.pushState({}, '', newUrl);
}

// [gemini] Fades out the charts container and sets it to 
// display: none (noblock) after fade-out
const fadeOutChartsContainer = () => {
    const chartsContainer = $('#charts-container');
    if (!chartsContainer) return;

    // Reset any ongoing transition/timeout behaviors
    chartsContainer.classList.remove('noblock');

    // Trigger layout reflow to make sure transition works
    void chartsContainer.offsetWidth;

    // Add fade-out class to trigger opacity transition
    chartsContainer.classList.add('fade-out');

    const handleTransitionEnd = (e) => {

        // Only run for opacity transition on the container itself
        if (e.propertyName === 'opacity') {
            chartsContainer.classList.add('noblock');
            chartsContainer.removeEventListener(
                'transitionend', handleTransitionEnd
            );
        }
    };
    chartsContainer.addEventListener('transitionend', handleTransitionEnd);
}


// [gpt] Layout menu auto-close timer handle
let layoutMenuTimer = null;

// [gpt] Restarts the layout menu inactivity timer
const resetLayoutMenuTimer = () => {
    clearTimeout(layoutMenuTimer);

    layoutMenuTimer = setTimeout(
        toggleLayoutMenu, 
        globals.layoutMenuAutoCloseMs
    );
}

// [gpt] Toggle the layout settings menu visibility
const toggleLayoutMenu = () => {
    const layoutEl = $('#layout');
    if (!layoutEl) return;

    // [gpt] Theme aspect widget shown only when menu is expanded
    const aspectWidget = $('#theme-aspect-widget');
    const isCollapsed = layoutEl.classList.contains('layout-collapsed');
    clearTimeout(layoutMenuTimer);

    if (isCollapsed) {
        layoutEl.classList.remove('layout-collapsed');
        if (aspectWidget) aspectWidget.classList.remove('noblock');
        resetLayoutMenuTimer();
    }
    else {
        layoutEl.classList.add('layout-collapsed');
        if (aspectWidget) aspectWidget.classList.add('noblock');
    }
}

// [gemini] Cycles the theme aspect ratio mode
const cycleThemeAspect = () => {
    resetLayoutMenuTimer();
    globals.results.activeThemeAspect =
        globals.results.activeThemeAspect === 'default'
            ? 'square'
            : 'default';

    const btn = $('#theme-aspect-cycle');

    if (btn) {
        btn.innerText =
            `aspect: ${globals.results.activeThemeAspect}`;
    }

    const gridImages = $('#grid-images');

    if (gridImages) {

        gridImages.classList.toggle(
            'theme-aspect-square',
            globals.results.activeThemeAspect === 'square'
        );
    }
}

// [gemini] Cycles the photogrid visual theme 
const cycleTheme = () => {
    resetLayoutMenuTimer();
    let currentIndex = globals.themes.indexOf(globals.results.activeTheme);
    if (currentIndex === -1) currentIndex = 0;

    const nextIndex = (currentIndex + 1) % globals.themes.length;
    const nextTheme = globals.themes[nextIndex];
    globals.results.activeTheme = nextTheme;

    // Update button text
    const themeCycleBtn = $('#theme-cycle');
    if (themeCycleBtn) {
        themeCycleBtn.innerText = `theme: ${nextTheme}`;
    }

    // Update classes on grid-images
    const gridImages = $('#grid-images');
    if (gridImages && gridImages.classList.contains('layout-pg')) {
        gridImages.classList.remove(...globals.themes.map(theme => `theme-${theme}`));
        gridImages.classList.add(`theme-${nextTheme}`);
    }

    // Sync hash
    const imgInput = $('input[name=img]');
    const imgSize = imgInput ? parseInt(imgInput.value, 10) || 50 : 50;
    syncFormInputsAndHash(true, imgSize);
}

// [gemini] Flip the image grid layout to photogrid (pg) client-side
const flipLayoutToPg = (imgSize) => {
    const gridImages = $('#grid-images');

    if (gridImages) {

        // [gemini] Clear theme classes before adding layout-pg and current 
        // activeTheme
        gridImages.classList.remove(
            'layout-pg', 
            'columns-250', 
            'columns-100', 
            'columns-50', 
            'theme-journal', 
            'theme-slate', 
            'theme-editorial',
            'theme-default'
        );
        gridImages.style.setProperty('--image-size', `${imgSize}px`);
        gridImages.style.setProperty('--column-gap', '2px');
        gridImages.classList.add('layout-pg');
        gridImages.classList.add(`theme-${globals.results.activeTheme}`);
    }

    // [gemini] Trigger smooth fade out of charts container
    fadeOutChartsContainer();

    const sizeWidget = $('#gridsize-widget');
    if (sizeWidget) {
        sizeWidget.classList.remove('noblock');
    }

    // [gemini] Show theme cycling widget
    const themeWidget = $('#theme-widget');
    if (themeWidget) {
        themeWidget.classList.remove('noblock');
    }

    const sizeDisplay = $('#gridsize-display');
    if (sizeDisplay) {
        sizeDisplay.innerText = `${imgSize}px`;
    }

    const layoutToggle = $('input[name=layout-toggle]');
    if (layoutToggle) {
        layoutToggle.checked = true;
    }
}

// [gemini] Flip the image grid layout to default client-side
const flipLayoutToDefault = () => {
    const gridImages = $('#grid-images');

    if (gridImages) {

        // [gemini] Clear photogrid themes when flipping layout back to default
        gridImages.classList.remove(
            'layout-pg', 
            'columns-250', 
            'columns-100', 
            'columns-50', 
            'theme-journal', 
            'theme-slate', 
            'theme-editorial',
            'theme-default'
        );
        gridImages.style.removeProperty('--image-size');
        gridImages.style.removeProperty('--column-gap');
        gridImages.classList.add('columns-250');
    }

    // [gemini] Restore chart container visibility and opacity
    const chartsContainer = $('#charts-container');
    if (chartsContainer) {
        chartsContainer.classList.remove('noblock', 'fade-out');
    }

    const sizeWidget = $('#gridsize-widget');
    if (sizeWidget) {
        sizeWidget.classList.add('noblock');
    }

    // [gemini] Hide theme cycling widget
    const themeWidget = $('#theme-widget');
    if (themeWidget) {
        themeWidget.classList.add('noblock');
    }

    const layoutToggle = $('input[name=layout-toggle]');
    if (layoutToggle) {
        layoutToggle.checked = false;
    }
}

// [gemini] Adjusts grid image size by delta on client-side 
// (bounds: 50px - 100px)
const adjustGridSize = (delta) => {
    resetLayoutMenuTimer();
    const imgInput = $('input[name=img]');
    let currentSize = imgInput ? parseInt(imgInput.value, 10) || 50 : 50;

    let newSize = currentSize + delta;
    if (newSize < 50) newSize = 50;
    if (newSize > 100) newSize = 100;

    const gridImages = $('#grid-images');
    if (gridImages) {
        gridImages.style.setProperty('--image-size', `${newSize}px`);
    }

    const sizeDisplay = $('#gridsize-display');
    if (sizeDisplay) {
        sizeDisplay.innerText = `${newSize}px`;
    }

    syncFormInputsAndHash(true, newSize);
}

// [gemini] Toggles layout. Fires submitForm() first time photogrid is 
// requested, subsequent toggles happen client-side
const toggleLayout = (e) => {
    resetLayoutMenuTimer();
    const isChecked = e.target.checked;

    if (isChecked) {
        if (globals.results.photogridLoaded) {
            const imgInput = $('input[name=img]');
            const imgSize = imgInput ? parseInt(imgInput.value, 10) || 50 : 50;
            flipLayoutToPg(imgSize);
            syncFormInputsAndHash(true, imgSize);
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
        if (globals.results.photogridLoaded) {
            flipLayoutToDefault();
            syncFormInputsAndHash(false, 50);
        } 
        else {
            const layoutInput = $('input[name=layout]');
            const imgInput = $('input[name=img]');
            if (layoutInput) layoutInput.value = 'normal';
            if (imgInput) imgInput.value = '250';
            submitForm();
        }
    }
}

// https://gomakethings.com/only-allowing-one-open-dropdown-at-a-time-with-the-details-element/
const controlDetails = (e) => {

    // Only run if the detail is open
    if (!e.target.open) return;

    // Get all other open dropdowns and close them
    var details = $$('details[open]');
    Array.prototype.forEach.call(details, function (detail) {
        if (detail === e.target) return;
        detail.removeAttribute('open');
    });
}

const insertExample = (e) => {
    $('#q').value = e.target.textContent;
    $('#ns-go').classList.add('glowing');

    const sources = $$('input[name=source');
    sources.forEach(s => {
        if (s.value === 'treatments') {
            s.checked = true;
        }
    })

    toggleExamples();

    e.stopPropagation();
    e.preventDefault();
}

const toggleRefreshCache = (e) => {
    $('#refreshCache').toggleAttribute('data-pop-show');
}

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
}

const asGo = (e) => {
    $('#throbber').classList.remove('nothrob');
    submitForm();

    e.stopPropagation();
    e.preventDefault();
}

const toggleModal = (e) => {
    const t = new URL(e.target.href).hash;
    const modals = $$('.modal');

    if (t.length > 0) {

        // first, let's close all open modals
        modals.forEach(m => {
            m.classList.add(...globals.hiddenClasses);
        });

        // now, let's open the targeted modal
        $(t).classList.remove(...globals.hiddenClasses);
    }

    // the 'close' button was clicked, so let's close all open modals
    else {
        modals.forEach(m => m.classList.add(...globals.hiddenClasses));
    }
}

const promptForSearchTerm = () => {
    $('#q').placeholder = "c'mon, type something";
    $('#q').classList.add('red-placeholder');
}

const resetPrompt = (e) => {
    $('#q').placeholder = globals.defaultPlaceholder;
    $('#q').classList.remove('red-placeholder');
    $('#refreshCache').checked = false;
}

const addListenersToFigDetails = () => {
    const figDetails = $$('figcaption > details');

    for (let i = 0, j = figDetails.length; i < j; i++) {
        figDetails[i].addEventListener('toggle', (event) => {
            const summary = event.target.querySelector('summary');
            const fullText = summary.dataset.title;
            const summaryText = fullText.length > 30
                ? `${fullText.substring(0, 30)}…`
                : fullText;

            summary.innerText = figDetails[i].open ? fullText : summaryText;
        });
    }
}

const addListenersToPagerLinks = () => {
    log.info('- listeners.addListenersToPagerLinks()');
}

const addListenersToFigureTypes = () => {
    const figtypes = $$('figure .reveal');
    for (let i = 0, j = figtypes.length; i < j; i++) {
        figtypes[i].addEventListener('click', reveal);
    }
}

function setMapSize(carouselbox) {
    const height = carouselbox.clientHeight;
    const map = carouselbox.querySelector('.map');

    if (!map.style.height) {

        // Set map height to height of the carousel box minus the height 
        // of the toggle control
        map.style.height = `${height - 28}px`;
    }
}

function carousel(box) {
    const toggle = box.querySelector('.toggle-checkbox');

    // Define the global counter, the items and the current item 
    let counter = 0;
    const items = box.querySelectorAll('.slide');
    const amount = items.length;
    let current = items[0];

    // add event handlers to buttons
    toggle.addEventListener('click', function (event) {
        const tgt = event.currentTarget;
        const carouselbox = tgt.parentNode.parentNode.parentNode;
        setMapSize(carouselbox);

        navigate(1);
        drawMap(event);
    });

    // show the first element 
    // (when direction is 0 counter doesn't change)
    navigate(0);

    // navigate through the carousel
    function navigate(direction) {

        // hide the old current list item 
        current.classList.remove('current');

        // calculate the new position
        counter = counter + direction;

        // if the previous one was chosen and the counter is less than 0 
        // make the counter the last element, thus looping the carousel
        if (direction === -1 && counter < 0) {
            counter = amount - 1;
        }

        // if the toggle button was clicked and there is no items element, 
        // set the counter to 0
        if (direction === 1 && !items[counter]) {
            counter = 0;
        }

        // set new current element and add CSS class
        current = items[counter];
        current.classList.add('current');
    }
}

function drawMap(event) {
    const tgt = event.currentTarget;
    const id = tgt.dataset.id;
    const map = globals.maps[id];

    if (!map) {
        const map = L.map(`map-${id}`);
        globals.maps[id] = map;
        const mapSource = 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
        // const mapSource = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(mapSource, {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const mcIcon = L.icon({
            iconUrl: '../../img/treatment.svg',
            iconSize: [10, 10],
            iconAnchor: [5, 5],
            // popupAnchor: [-3, -76],
            // shadowUrl: 'my-icon-shadow.png',
            // shadowSize: [68, 95],
            // shadowAnchor: [22, 94]
        })

        let centroid;

        if (tgt.dataset.loc !== 'undefined') {
            const loc = JSON.parse(tgt.dataset.loc);

            const points = loc
                .map(point => [point.latitude, point.longitude]);

            points.forEach((point, index) => {
                if (index === 0) {
                    centroid = point;
                }

                L.marker(point, { icon: mcIcon }).addTo(map);
            })

            map.setView(centroid, 10);
        }
        else if (tgt.dataset.convexhull) {
            const convexhull = JSON.parse(tgt.dataset.convexhull);
            const polygon = L.polygon(
                convexhull,
                { color: '#9BC134', weight: 1 }
            ).addTo(map);
            convexhull.forEach((point, index) => {
                L.marker(point, { icon: mcIcon }).addTo(map);
            });
            map.fitBounds(polygon.getBounds());
        }
    }
}

function addListenersToMapCarouselLink() {
    $$(".carouselbox").forEach(box => {

        if (!box.querySelector('.buttons')) {
            return;
        }

        carousel(box);
    });
}

const toggleDateSelector = (e) => {
    const srcName = e.target.name;

    if (e.target.value === 'between') {

        //const tos = e.target.parentNode.querySelectorAll('.hidden');
        const tos = $$(`#${srcName}-range .hidden`);

        tos.forEach(t => {
            if (t.classList.contains('hidden')) {
                t.classList.remove('hidden');
                t.classList.add('vis');
            }
        })
    }
    else {
        //const tos = e.target.parentNode.querySelectorAll('.vis');
        const tos = $$(`#${srcName}-range .vis`);

        tos.forEach(t => {
            t.classList.add('hidden');
            t.classList.remove('vis');
        })
    }
}

function showTooltip(evt, text) {
    const sparkTip = $("#sparkTip");
    sparkTip.innerHTML = text;
    sparkTip.classList.remove('hidden');
    sparkTip.classList.add('visible');
}

function hideTooltip() {
    const sparkTip = $("#sparkTip");
    sparkTip.classList.remove('visible');
    sparkTip.classList.add('hidden');
}

function lightUpTheBox() {
    new SimpleLightbox({
        elements: 'figure',
        loadingCaption: '<img src="../../img/bug.gif">',
        //captionAttribute: 'details'
    });
}

export {
    addListeners,
    addListenersToFigDetails,
    addListenersToPagerLinks,
    addListenersToFigureTypes,
    addListenersToMapCarouselLink,
    toggleSearch,
    toggleResource,
    toggleLayout,
    toggleWarn,
    toggleAdvSearch,
    toggleDateSelector,
    showTooltip,
    hideTooltip,
    toggleModal,
    lightUpTheBox,
    fadeOutChartsContainer
};