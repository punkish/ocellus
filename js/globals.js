log.level = log.INFO;

/**
 * Application-wide configuration and mutable runtime state.
 *
 * URI configuration is intentionally absent here. At startup,
 * tweakUrl() in ocellus.js reads globals.env and writes the
 * resolved URIs to window.Ocellus.uris, which all modules use.
 * The former globals.uri object was dead config — it was never
 * read after tweakUrl() ran — and has been removed.
 */
export const globals = {
    // mode: 'airgapped',
    mode: 'connected',

    fetchOpts: {},

    /**
     * Per-hostname URI overrides consumed by tweakUrl().
     * Falls back to 'localhost' when the hostname is unrecognised.
     */
    env: {
        'lucknow.local': {
            zenodeo: 'http://lucknow.local:3010/v3',
            maps:    'http://lucknow.local:3010/v3/geo'
        },
        'ocellus.info': {
            zenodeo: 'https://test.zenodeo.org/v3',
            maps:    'https://test.zenodeo.org/v3/geo'
        },
        'localhost': {
            zenodeo: 'http://localhost:3010/v3',
            maps:    'http://localhost:3010/v3/geo'
        },
    },

    cache: {
        images: {
            yearlyCounts: false,
            totals: false
        },
        'images-geo': {
            yearlyCounts: false,
            totals: false
        },
        treatments: {
            yearlyCounts: false,
            totals: false
        },
        journals:        null,
        collectionCodes: null,
        bins:            null
    },

    /**
     * Named figure sizes used to drive CSS column classes
     * (columns-250, columns-100, columns-50) in default layout.
     * Column class names are derived from these values in layout.js
     * so there is one source of truth.
     */
    figureSize: {
        normal: 250,
        small:  100,
        tiny:   50
    },

    defaultPlaceholder: 'search images',

    /**
     * Ordered list of photogrid visual themes.
     * cycleTheme() in layout.js steps through this array.
     * Theme CSS class names are derived as `theme-${name}`.
     */
    themes: [
        'default',
        'journal',
        'slate',
        'editorial'
    ],

    /**
     * Available aspect ratio modes for the photogrid.
     * cycleThemeAspect() in layout.js toggles between these.
     */
    themeAspect: [
        'default',
        'square'
    ],

    /**
     * Milliseconds of inactivity before the layout
     * settings gear-menu auto-closes.
     */
    layoutMenuAutoCloseMs: 10000,

    results: {
        totalCount:        0,
        figures:           [],
        page:              1,
        size:              30,

        /**
         * True after the first photogrid server-fetch
         * completes. Subsequent layout toggles flip client-side
         * without re-fetching.
         */
        photogridLoaded:   false,

        activeTheme:       'default',

        /**
         * Initialised here — was missing from the original,
         * causing cycleThemeAspect() to compare against undefined
         * on the first click.
         */
        activeThemeAspect: 'default'
    },

    // 'real' resources fetched from the API
    resources:      ['treatments', 'citations', 'images'],

    // Pseudo-resources are modals already in index.html,
    // shown/hidden on demand rather than fetched
    pseudoResources: ['about', 'ip', 'contact', 'privacy'],

    params: {

        /**
         * Keys allowed in the query string but excluded
         * from the free-text 'q' input field.
         */
        notValidQ: [
            'resource', 'page', 'size', 'grid',
            'refreshCache', 'cols'
        ],

        validImages: [
            'httpUri',
            'caption',
            'captionText',
            'q',
            'treatmentId',
            'treatmentTitle',
            'articleTitle',
            'treatmentDOI',
            'articleDOI',
            'zenodoDep',
            'authorityName',
            'collectionCode',
            'status',
            'journalTitle',
            'journalYear',
            'kingdom',
            'phylum',
            'class',
            'family',
            'order',
            'genus',
            'species',
            'publicationDate',
            'checkinTime',
            'latitude',
            'longitude',
            'geolocation',
            'isOnLand',
            'validGeo',
            'eco_name',
            'biome',
            'biome_id'
        ],

        validTreatments: [
            'treatmentId',
            'treatmentTitle',
            'treatmentDOI',
            'zenodoDep',
            'articleTitle',
            'articleDOI',
            'publicationDate',
            'journalYear',
            'authorityName',
            'status',
            'checkinTime',
            'validGeo',
            'q',
            'latitude',
            'longitude',
            'geolocation',
            'eco_name',
            'biome',
            'isOnLand',
            'journalTitle',
            'kingdom',
            'phylum',
            'class',
            'family',
            'order',
            'genus',
            'species',
        ],

        validCommon: [
            'refreshCache',
            'page',
            'size',
            'cols',
            'groupby'
        ],

        /**
         * Keys stripped before building the human-readable
         * search-criteria summary in renderSearchCriteria().
         */
        notValidSearchCriteria: [
            'resource',
            'communities',
            'communitiesChooser',
            'refreshCache',
            'view',
            'size',
            'page',
            'reset',
            'submit',
            'source',
            'grid'
        ]
    },

    cols: {
        images: [
            'treatmentId',   'treatmentTitle', 'zenodoDep',
            'treatmentDOI',  'articleTitle',   'articleAuthor',
            'httpUri',       'caption',        'latitude',
            'longitude'
        ],

        treatments: [
            'treatmentId',  'treatmentTitle', 'zenodoDep',
            'treatmentDOI', 'articleTitle',   'articleAuthor',
            'journalTitle', 'latitude',       'longitude'
        ]
    },

    /**
     * Keyed by a unique per-figure id; populated lazily
     * in drawMap() as treatment-location mini-maps are opened.
     */
    maps: {},

    /**
     * CSS classes used to hide elements. Kept as an
     * array so they can be spread into classList calls.
     */
    hiddenClasses: ['hidden', 'noblock'],

    closedFigcaptionHeight: '30px',

    /**
     * Sequential colour ramp for H3 hexagonal density
     * cells on the map. Low density → light yellow; high → dark red.
     */
    H3ColorRamp: [
        '#ffffcc',
        '#ffeda0',
        '#fed976',
        '#feb24c',
        '#fd8d3c',
        '#fc4e2a',
        '#e31a1c',
        '#b10026',
    ],

    months: [
        'January',   'February', 'March',    'April',
        'May',       'June',     'July',     'August',
        'September', 'October',  'November', 'December'
    ],

    charts: {
        termFreq:    null,
        yearlyCounts: null
    }

};

/**
 * Returns Leaflet marker icon definitions.
 *
 * Intentionally a function rather than a property on globals,
 * because L.icon() must not be called at module-parse time —
 * Leaflet may not yet be initialised. Call this after init().
 *
 * @returns {{ default: L.Icon, active: L.Icon, clicked: L.Icon }}
 */
export function getMarkerIcons() {

    const shadow = {
        shadowUrl:    '/img/marker-shadow.png',
        shadowSize:   [41, 41],
    };

    const base = {
        iconSize:    [24, 38],
        iconAnchor:  [12, 38],
        popupAnchor: [0, 0],
        ...shadow
    };

    return {
        default: L.icon({
            iconUrl:      '/img/marker.png',
            shadowAnchor: [11, 37],
            ...base
        }),
        active: L.icon({
            iconUrl:      '/img/marker-active.png',
            shadowAnchor: [12, 38],
            ...base
        }),
        clicked: L.icon({
            iconUrl:      '/img/marker-clicked.png',
            shadowAnchor: [12, 38],
            ...base
        })
    };
}
