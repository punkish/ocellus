const globals = {

    server: window.location.hostname === 'localhost' 
        ? 'http://localhost:3010/v3' 
        : 'https://test.zenodeo.org/v3',

    // validQsKeys: [
    //     'page',
    //     'size',
    //     'resource',
    //     'q',
    //     'refreshCache'
    // ],

    cache: {
        images: {
            yearlyCounts: false,
            totals: false
        },
        treatments: {
            yearlyCounts: false,
            totals: false
        }
    },

    // various querystring defaults
    // 'view' is the only one we update based on the value in the qs
    // page        : 1,
    // size        : 30,
    // fpage       : 1,
    // fsize       : 30,
    // refreshCache: false,
    figureSize:  {
        normal: 250,
        small: 100,
        tiny: 50
    },

    defaultPlaceholder: 'search images',

    //view : 'images',
    // views : {
    //     images: {
    //         description: 'images from Zenodo',
    //         totalCount: 0,
    //         figures: [],
    //         page: 1,
    //         size: 30
    //     },
    //     treatments: {
    //         description: 'treatments with images',
    //         totalCount: 0,
    //         countOfTreatments: 0,
    //         countOfFigures: 0,
    //         figures: [],
    //         page: 1,
    //         size: 30,
    //         figpage: 2,
    //         figsize: 30
    //     },
    //     map: {
    //         description: 'treatments with locations',
    //         totalCount: 0,
    //         obj: null,
    //         bounds: null,
    //         layers: {
    //             baselayer: {
    //                 groups: {
    //                     osm: null
    //                 }
    //             },
    //             h3: {
    //                 groups: {
    //                     grid2: null
    //                 },
    //                 controls: {
    //                     info: null,
    //                     legend: null
    //                 }
    //             },
    //             treatments: {
    //                 groups: {
    //                     treatmentsOnLand: null,
    //                     treatmentsInWater: null
    //                 },
    //                 controls: {
    //                     layerControl: null
    //                 }
    //             }
    //         }
    //     }
    // },

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

        // validQs: [
        //     'page',
        //     'size',
        //     'resource',
        //     'q',
        //     'refreshCache'
        // ],

        // params allowed in queryString but not in the 
        // 'q' input field
        notValidQ: ['resource', 'page', 'size', 'grid', 'refreshCache', 'cols'],

        // params valid for Zenodo
        // validZenodo: [
        //     'id',
        //     'subtype',
        //     'communities',
        //     'q',
        //     'creator',
        //     'title',
        //     'keywords'
        // ],

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

        // the following are the valid query params for Zenodeo
        // validZenodeo: [
        //     'httpUri',
        //     'caption',
        //     'captionText',
        //     'treatmentId',
        //     'treatmentTitle',
        //     'articleTitle',
        //     'treatmentDOI',
        //     'articleDOI',
        //     'zenodoDep',
        //     'q',
        //     'journalTitle',
        //     'journalYear',
        //     'authorityName',
        //     'kingdom',
        //     'phylum',
        //     'class',
        //     'family',
        //     'order',
        //     'genus',
        //     'species',
        //     'status',
        //     'publicationDate',
        //     'checkinTime',
        //     'latitude',
        //     'longitude',
        //     'geolocation',
        //     'isOnLand',
        //     'validGeo',
        //     'eco_name',
        //     'biome',
        //     'refreshCache',
        //     'page',
        //     'size',
        //     'cols'
        // ],

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
        ],

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

    // // the following params don't go in the q field
    // notq: ['resource', 'page', 'size', 'grid', 'refreshCache', 'cols'],

    // // the following are the valid query params for Zenodo
    // validZenodo: [
    //     'id',
    //     'subtype',
    //     'communities',
    //     'q',
    //     'creator',
    //     'title',
    //     'keywords'
    // ],

    // the following are the valid query params for Zenodeo
    // validZenodeo: [
    //     //     'treatmentVersion',
    //     //     'treatmentLSID',
    //     //     'zoobankId',
    //     //     'articleId',
    //     //     'articleTitle',
    //     //     'articleAuthor',
    //     //     'articleDOI',
    //     //     'journalVolume',
    //     //     'journalIssue',
    //     //     'pages',
    //     //     'authorityYear',
    //     //     'status',
    //     //     'taxonomicNameLabel',
    //     //     'rank',
    //     //     'collectionCode',
    //     //     'updateTime',
    //     'httpUri',
    //     'captionText',
    //     'treatmentId',
    //     'treatmentTitle',
    //     'treatmentDOI',
    //     'zenodoDep',
    //     'q',
    //     'journalTitle',
    //     'journalYear',
    //     'authorityName',
    //     'kingdom',
    //     'phylum',
    //     'class',
    //     'family',
    //     'order',
    //     'genus',
    //     'species',
    //     'publicationDate',
    //     'checkinTime',
    //     'latitude',
    //     'longitude',
    //     'geolocation',
    //     'isOnLand',
    //     'validGeo',
    //     'refreshCache',
    //     'page',
    //     'size',
    //     'cols',
    //     //'resource'
    // ],

    hiddenClasses: ['hidden', 'noblock'],

    /**
     * the following input params are ignored while creating the 
     * textual version of the search criteria
     */
    // notInSearchCriteria : [
    //     'resource', 
    //     'communities', 
    //     'communitiesChooser',
    //     'refreshCache', 
    //     'view',
    //     'size', 
    //     'page',
    //     'reset',
    //     'submit',
    //     'source',
    //     'grid'
    // ],

    closedFigcaptionHeight : '30px',

    zenodoUri: 'https://zenodo.org/records',
    tbUri: 'https://tb.plazi.org/GgServer/html',

    /* map related globals */
    // map       : null,
    // mapBounds : null,
    // mapLayers : {},

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

    treatmentIcon : { 
        iconUrl     : '/img/treatment.svg', 
        iconSize    : [24, 24],
        iconAnchor  : [0, 0],
        popupAnchor : [13, 12]
    },

    treatmentIconHighlighted : { 
        iconUrl     : '/img/treatment-highlighted.svg', 
        iconSize    : [24, 24],
        iconAnchor  : [0, 0],
        popupAnchor : [13, 12]
    },

    // pager
    // pager_length  : 9,
    // sep           : '•••',
    // sep_position1 : 2,
    // sep_position2 : 6,

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