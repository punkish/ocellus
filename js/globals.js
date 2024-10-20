function getUrls() {
    const cond1 = window.location.hostname === 'ocellus.localhost';
    const cond2 = window.location.hostname === 'ocellus.local';
    const cond3 = window.location.hostname === '127.0.0.1';
    const cond4 = window.location.hostname === 'localhost';
    
    let zenodeo = 'https://test.zenodeo.org/v3';
    let maps = 'https://maps.zenodeo.org';
    const zenodo = 'https://zenodo.org';
    const treatmentBank = 'https://tb.plazi.org/GgServer/html';

    if (cond1 || cond2 || cond3 || cond4) {
        zenodeo = `http://${window.location.hostname}:3010/v3`;
        maps = `http://${window.location.hostname}:3000`;
    }

    return {
        zenodeo,
        maps,
        zenodo,
        treatmentBank
    }
}

const globals = {

    fetchOpts: {
        // method: "GET",
        // headers: new Headers({
        //     "ngrok-skip-browser-warning": true,
        // }),
    },

    uri: getUrls(),
    
    cache: {
        images: {
            yearlyCounts: false,
            totals: false
        },
        treatments: {
            yearlyCounts: false,
            totals: false
        },
        journals: null,
        collectionCodes: null,
        bins: {}
    },

    figureSize:  {
        normal: 250,
        small: 100,
        tiny: 50
    },

    defaultPlaceholder: 'search images',

    results: {
        totalCount: 0,
        figures: [],
        page: 1,
        size: 30
    },

    // resource are what are fetched from remote and displayed
    // pseudoresources are modals that are already embeddeded 
    // in index.html and are shown or hidden on demand
    // 
    resources       : ['treatments', 'citations', 'images'],
    pseudoResources : ['about', 'ip', 'contact', 'privacy'],

    params: {
        
        // params allowed in queryString but not in the 'q' input field
        notValidQ: ['resource', 'page', 'size', 'grid', 'refreshCache', 'cols'],

        validImages: [
            'httpUri',
            'caption', // search against images.captionText
            'captionText', // search against imagesFts.captionText
            'q',
            'treatmentId',
            'treatmentTitle',
            'articleTitle',
            'treatmentDOI',
            'articleDOI',
            'zenodoDep',
            'authorityName',
            // 'articleAuthor',
            'collectionCode',
            'status',
            'journalTitle',
            'journals_id',
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
            // 'realm'
        ],

        validTreatments: [
            'treatmentId',
            'treatmentTitle',
            'treatmentDOI',
            'zenodoDep',
            'articleTitle',
            // 'articleAuthor',
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

        // the following input params are ignored while creating the 
        // textual version of the search criteria
        // 
        notValidSearchCriteria : [
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
            'treatmentId', 'treatmentTitle', 'zenodoDep', 'treatmentDOI', 
            'articleTitle', 'articleAuthor', 'httpUri', 'caption', 'latitude',
            'longitude'
        ],

        treatments: [ 
            'treatmentId', 'treatmentTitle', 'zenodoDep', 'treatmentDOI', 
            'articleTitle', 'articleAuthor', 'journalTitle', 'latitude',
            'longitude'
        ]
    },

    maps: {},

    hiddenClasses: ['hidden', 'noblock'],

    closedFigcaptionHeight : '30px',

    // h3 layer colors
    H3ColorRamp : [
        '#ffffcc',
        '#ffeda0',
        '#fed976',
        '#feb24c',
        '#fd8d3c',
        '#fc4e2a',
        '#e31a1c',
        '#b10026',
    ],

    markerIcons : {
        default: L.icon({
            iconUrl: '/img/marker.png',
            iconSize: [24, 38],
            iconAnchor: [12, 38],
            popupAnchor: [0, 0],
            shadowUrl: '/img/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [11, 37]
        }),
        active: L.icon({
            iconUrl: '/img/marker-active.png',
            iconSize: [24, 38],
            iconAnchor: [12, 38],
            popupAnchor: [0, 0],
            shadowUrl: '/img/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 38]
        }),
        clicked: L.icon({
            iconUrl: '/img/marker-clicked.png',
            iconSize: [24, 38],
            iconAnchor: [12, 38],
            popupAnchor: [0, 0],
            shadowUrl: '/img/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 38]
        })
    },

    months: [ 
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 
        'August', 'September', 'October', 'November', 'December'
    ],

    charts: {
        termFreq: null,
        yearlyCounts: null
    }
    
};

export { globals }