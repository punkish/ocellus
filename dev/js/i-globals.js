const globals = {

    // various querystring defaults
    // 'view' is the only one we update based on the value in the qs
    page        : 1,
    size        : 30,
    fpage       : 1,
    fsize       : 30,
    refreshCache: false,

    //view : 'images',
    views : {
        images: {
            description: 'images from Zenodo',
            totalCount: 0,
            figures: [],
            page: 1,
            size: 30
        },
        treatments: {
            description: 'treatments with images',
            totalCount: 0,
            countOfTreatments: 0,
            countOfFigures: 0,
            figures: [],
            page: 1,
            size: 30,
            figpage: 2,
            figsize: 30
        },
        map: {
            description: 'treatments with locations',
            totalCount: 0,
            obj: null,
            bounds: null,
            layers: {
                baselayer: {
                    groups: {
                        osm: null
                    }
                },
                h3: {
                    groups: {
                        grid2: null
                    },
                    controls: {
                        info: null,
                        legend: null
                    }
                },
                treatments: {
                    groups: {
                        treatmentsOnLand: null,
                        treatmentsInWater: null
                    },
                    controls: {
                        layerControl: null
                    }
                }
            }
        }
    },

    results: {
        totalCount: 0,
        figures: [],
        page: 1,
        size: 30
    },

    /*
    * resource are what are fetched from remote and displayed
    * pseudoresources are modals that are already embeddeded 
    * in index.html and are shown or hidden on demand
    */
    resources       : ['treatments', 'citations', 'images'],
    pseudoResources : ['about', 'ip', 'contact', 'privacy'],

    // the following are the valid query params
    validQueryParams : [
        'communities', 
        'view', 
        'page', 
        'size', 
        'q',
        //'refreshCache'
    ],

    // the following params don't go in the q field
    not_q : [
        'view',
        'refreshCache',
        'go'
    ],

    hiddenClasses: ['hidden', 'noblock'],

    // valid params for zenodeo uri
    // zenodeoUriParams : {
    //     images: [ 'q', 'size', 'page', 'communities', 'refreshCache' ],
    //     treatments: [ 'q', 'size', 'page', 'refreshCache' ],
    //     citations: [ 'q', 'size', 'page', 'refreshCache' ]
    // },

    // valid params for browser uri
    // browserUriParams : {
    //     images: [ 'q', 'size', 'page', 'communities' ],
    //     treatments: [ 'q', 'size', 'page' ],
    //     citations: [ 'q', 'size', 'page' ]
    // },

    /*
    * the following input params are ignored while creating the 
    * textual version of the search criteria
    */
    notInSearchCriteria : [
        'resource', 
        'communities', 
        'communitiesChooser',
        'refreshCache', 
        'view',
        'size', 
        'page',
        'reset',
        'submit'
    ],

    closedFigcaptionHeight : '30px',

    zenodoUri: 'https://zenodo.org/record',
    tbUri: 'https://tb.plazi.org/GgServer/html',

    // values for the following are taken from config.js
    // zenodeoUri   : '',
    // zenodeo3Uri  : '',
    // ocellusUri   : '',
    // ocellus4tUri : '',
    // ocellus4mUri : '',

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
    pager_length  : 9,
    sep           : '•••',
    sep_position1 : 2,
    sep_position2 : 6,
};

export {globals}