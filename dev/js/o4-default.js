if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};
if (!('default' in O)) O.default = {};


O.default.zenodoUri = 'https://zenodo.org/record/';

O.default.map = {
    url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicHVua2lzaCIsImEiOiJjajhvOXY0dW8wMTA3MndvMzBlamlhaGZyIn0.3Ye8NRiiGyjJ1fud7VbtOA',
    leaflet: {}
};

O.default.search = {};

// 'simple' or 'fancy'
O.default.search.type = 'simple'; 

O.default.search.inputs = {
    go: {
        name: 'go',
        type: 'button',
        value: 'go',
        search: [],
        browser: false
    },

    resource: [
        {
            name: 'resource',
            type: 'radio',
            value: 'images',
            checked: true,
            search: ['simple', 'fancy'],
            browser: false
        },

        {
            name: 'resource',
            type: 'radio',
            value: 'treatments',
            checked: false,
            search: ['simple', 'fancy']
        }
    ],

    communities: [
        {
            name: 'communities',
            type: 'checkbox',
            value: 'biosyslit',
            checked: true,
            search: ['simple', 'fancy']
        },

        {
            name: 'communities',
            type: 'checkbox',
            value: 'belgiumherbarium',
            checked: false,
            search: ['simple', 'fancy']
        }
    ],

    refreshCache: {
        name: 'refreshCache',
        type: 'checkbox',
        value: true,
        checked: false,
        search: ['simple', 'fancy']
    },

    q: {
        name: 'q',
        type: 'text',
        value: '',
        search: ['simple']
    },

    text: {
        name: 'text',
        type: 'text',
        value: '',
        search: ['fancy']
    },

    doi: {
        name: 'doi',
        type: 'text',
        value: '',
        search: ['fancy']
    },

    author: {
        name: 'author',
        type: 'text',
        value: '',
        search: ['fancy']
    },

    title: {
        name: 'title',
        type: 'text',
        value: '',
        search: ['fancy']
    },

    size: {
        name: 'size',
        type: 'hidden',
        value: '30',
        search: ['simple', 'fancy']
    },

    page: {
        name: 'page',
        type: 'hidden',
        value: '1',
        search: ['simple', 'fancy']
    }
};

O.default.search.fancyParams = [
    {   "key": "text",
        "values": [], 
        "prompt": "Enter text to search anywhere (full-text search)",
        "noDuplicates": true 
    }, 
    {   "key": "title",
        "values": [], 
        "prompt": "Enter text to search in the 'title' field",
        "noDuplicates": true 
    },
    {   "key": "doi",
        "values": [], 
        "prompt": "Enter the exact DOI of the publication",
        "noDuplicates": true 
    },
    {   "key": "author", 
        "values": "https://zenodeo.punkish.org/v2/authors",
        "prompt": "Type at lease 3 letters to get suggestions",
        "noDuplicates": false
    }
];

O.default.resource = 'images';

O.default.figure = {};
O.default.figure.captionHeight = '30px';


O.default.qPlaceholder = "c’mon, enter something";

// 'compact' or 'spaced'
O.default.imagesLayout = 'compact'; 

