/**
 * Post-render figure event wiring.
 *
 * Contains the five functions that must be called after each
 * new batch of search results is injected into #grid-images:
 *
 *   addListenersToFigDetails       — expand/collapse figcaptions
 *   addListenersToFigureTypes      — reveal buttons on figures
 *   addListenersToMapCarouselLink  — image ↔ map carousel toggle
 *   toggleAdvSearch                — advanced-search panel toggle
 *   lightUpTheBox                  — SimpleLightbox init
 *
 * WHY A SEPARATE MODULE?
 * ----------------------
 * These functions were previously in listeners.js and called
 * from renderPage() in renderers.js:
 *
 *   renderers.js → listeners.js   (import for post-render wiring)
 *   listeners.js → querier.js     (getResource)
 *   querier.js   → renderers.js   (makeSlider, renderPage)
 *   ⟹ cycle: renderers → listeners → querier → renderers
 *
 * Moving the post-render calls into querier.js (the natural place
 * after renderPage() returns) would create a new cycle:
 *
 *   querier.js   → listeners.js   (for the wiring functions)
 *   listeners.js → querier.js     (getResource)
 *   ⟹ cycle: querier → listeners → querier
 *
 * This module has no imports from querier.js or renderers.js,
 * so it can be imported by querier.js without creating any cycle.
 * listeners.js re-exports these functions unchanged, so callers
 * outside querier.js (e.g. ocellus.js) are unaffected.
 *
 * Dependency chain after this change:
 *
 *   querier.js → figure-listeners.js → base.js, globals.js,
 *                                       mapping/index.js
 *   querier.js → renderers.js → base.js, globals.js, layout.js, …
 *   listeners.js → querier.js, figure-listeners.js, …
 *   renderers.js  (no longer imports listeners.js or querier.js)
 *   sparkline.js  → querier.js  (no cycle — sparkline not imported
 *                                by querier or renderers)
 *
 * Public API (re-exported unchanged from listeners.js)
 * ----------------------------------------------------
 *   addListenersToFigDetails()
 *   addListenersToFigureTypes()
 *   addListenersToMapCarouselLink()
 *   toggleAdvSearch([event])
 *   lightUpTheBox()
 */

import { $, $$ }         from './base.js';
import { globals }       from './globals.js';
import { initializeMap } from './mapping/index.js';

// ---------------------------------------------------------------------------
// Figure caption toggle
// ---------------------------------------------------------------------------

/**
 * Adds toggle handlers to figure captions: expands and
 * truncates the title text when the <details> element is toggled.
 */
const addListenersToFigDetails = () => {

    const figDetails = $$('figcaption > details');

    for (let i = 0, j = figDetails.length; i < j; i++) {

        figDetails[i].addEventListener('toggle', (event) => {

            const summary   = event.target.querySelector('summary');
            const fullText  = summary.dataset.title;
            const summaryText = fullText.length > 30
                ? `${fullText.substring(0, 30)}…`
                : fullText;

            summary.innerText = figDetails[i].open
                ? fullText
                : summaryText;
        });
    }
};

// ---------------------------------------------------------------------------
// Figure type reveal
// ---------------------------------------------------------------------------

/**
 * Adds click handlers to image reveal buttons inside
 * figure elements.
 */
const addListenersToFigureTypes = () => {

    const figtypes = $$('figure .reveal');

    for (let i = 0, j = figtypes.length; i < j; i++) {
        figtypes[i].addEventListener('click', reveal);
    }
};

// ---------------------------------------------------------------------------
// Map carousel
// ---------------------------------------------------------------------------

/**
 * Sets up carousel navigation for each figure that has
 * geo data, including map initialisation on the map slide toggle.
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
 * Initialises a carousel within a figure box.
 * @param {Element} box - The carouselbox element
 */
function carousel(box) {

    const toggle = box.querySelector('.toggle-checkbox');

    let counter  = 0;
    const items  = box.querySelectorAll('.slide');
    const amount = items.length;
    let current  = items[0];

    toggle.addEventListener('click', function (event) {

        const tgt        = event.currentTarget;
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
 * Sets the height of a mini-map to match its carousel
 * container, so the map fills the slide correctly.
 * @param {Element} carouselbox
 */
function setMapSize(carouselbox) {

    const height = carouselbox.clientHeight;
    const map    = carouselbox.querySelector('.map');

    if (!map.style.height) {
        map.style.height = `${height - 28}px`;
    }
}

/**
 * Initialises and draws a mini-map for a figure's
 * location(s) or convex hull. Called when the user toggles the
 * map slide in a carousel.
 * @param {Event} event
 */
function drawMap(event) {

    const tgt = event.currentTarget;
    const id  = tgt.dataset.id;
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
            iconUrl:    '../../img/treatment.svg',
            iconSize:   [10, 10],
            iconAnchor: [5, 5]
        });

        let centroid;

        if (tgt.dataset.loc !== 'undefined') {

            const loc    = JSON.parse(tgt.dataset.loc);
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

            const convexhull = JSON.parse(tgt.dataset.convexhull);

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
// Advanced search toggle
// ---------------------------------------------------------------------------

/**
 * Toggles the advanced-search panel visibility and
 * updates form input focus. Also initialises a map for geolocation
 * drawing when advanced search is activated.
 *
 * Kept here (rather than remaining only in listeners.js) so that
 * querier.js can call it after renderPage() without importing
 * from listeners.js.
 *
 * @param {Event} [e]
 */
const toggleAdvSearch = (e) => {

    log.info('- toggling advanced search');

    $('#as-container').classList.toggle('noblock');

    const advSearchIsActive =
        $('input[name=searchtype]').checked;

    if (advSearchIsActive) {
        $('#q').value       = '';
        $('#q').placeholder = 'use advanced search below';
        $('#q').disabled    = true;
        $('#refreshCache').disabled = true;
        $('#clear-q').disabled      = true;
        $('input[name="as-q"]').focus();

        initializeMap({
            mapContainer:    'mapSearch',
            baseLayerSource: 'geodeo',
            drawControl:     true
        });
    }
    else {
        $('#q').placeholder = globals.defaultPlaceholder;
        $('#q').disabled    = false;
        $('#refreshCache').disabled = false;
        $('#clear-q').disabled      = false;
    }
};

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

/**
 * Initialises SimpleLightbox for all figures currently
 * in #grid-images. Called after each new set of results is rendered.
 */
function lightUpTheBox() {

    new SimpleLightbox({
        elements:       'figure',
        loadingCaption: '<img src="../../img/bug.gif">'
    });
}

// ---------------------------------------------------------------------------
// Reveal (legacy placeholder)
// ---------------------------------------------------------------------------

/**
 * Placeholder for image reveal logic (currently unused;
 * preserved for backwards compatibility).
 */
function reveal() {
    // No implementation in original
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
    addListenersToFigDetails,
    addListenersToFigureTypes,
    addListenersToMapCarouselLink,
    toggleAdvSearch,
    lightUpTheBox
};
