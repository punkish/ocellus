if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('base' in BLR)) BLR.base = {};

BLR.base.size = 30;
BLR.base.zenodo = 'https://zenodo.org/record/';
BLR.base.dom = {
    panels: document.querySelectorAll('.panel'),
    modals: document.querySelectorAll('.modal'),
    resources: document.querySelectorAll('.resource'),
    headerContainer: document.querySelector('header'),

    header: document.querySelector('#header'),
    index: document.querySelector('#index'),
    throbber: document.querySelector('#throbber'),

    form: document.querySelector('form'),
    q: document.querySelector('form input[name=q]'),
    go: document.querySelector('form input[name=go]'),
    resourceSelector: document.querySelector('form > nav'),
    urlFlagSelectors: document.querySelectorAll('form .urlFlag'),
    communitiesSelector: document.querySelector('form .drop-down'),
    communityCheckBoxes: document.querySelectorAll('form input[name=communities]'),
    allCommunities: document.querySelector('form input[value="all communities"]'),
    refreshCacheSelector: document.querySelector('form input[name=refreshCache]'),
    refreshCacheWarning: document.querySelector('form .refreshCacheWarning'),

    title: document.querySelector('a.title'),

    'modal-open': document.querySelectorAll('.modal-open'),
    'modal-close': document.querySelectorAll('.modal-close'),  
    
    map: document.querySelector('#map'),
    images: {
        section: document.querySelector('#images'),
        searchCriteria: document.querySelector('#images .searchCriteria'),
        charts: document.querySelector('#images .charts'),
        results: document.querySelector('#images .results')
    },
    treatment: {
        section: document.querySelector('#treatment'),
        searchCriteria: document.querySelector('#treatment .searchCriteria'),
        charts: document.querySelector('#treatment .charts'),
        results: document.querySelector('#treatment .results')
    },
    treatments: {
        section: document.querySelector('#treatments'),
        searchCriteria: document.querySelector('#treatments .searchCriteria'),
        charts: document.querySelector('#treatments .charts'),
        results: document.querySelector('#treatments .results')
    },
    wrapper: document.querySelector('#wrapper')
};

BLR.base.templates = {

    partials: {
        'template-pager': document.querySelector('#template-pager').innerHTML,
        'template-records-found': document.querySelector('#template-records-found').innerHTML,
        'template-charts': document.querySelector('#template-charts').innerHTML,
        'template-figures': document.querySelector('#template-figures').innerHTML
    },

    wholes: {
        treatments: document.querySelector('#template-treatments').innerHTML,
        treatment: document.querySelector('#template-treatment').innerHTML,
        images: document.querySelector('#template-images').innerHTML
    }
};

BLR.base.map = {
    url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicHVua2lzaCIsImEiOiJjajhvOXY0dW8wMTA3MndvMzBlamlhaGZyIn0.3Ye8NRiiGyjJ1fud7VbtOA',
    leaflet: {}
};

BLR.base.modals = Array.from(BLR.base.dom.modals).map(m => m.id);

BLR.base.resources = Array.from(BLR.base.dom.resources).map(m => m.id);

BLR.base.resource = '';

BLR.base.defaultResource = 'images';
BLR.base.figcaptionHeight = '30px';
BLR.base.figcaptions = []; 
BLR.base.savedPanel = {
    id: '',
    search: ''
};

BLR.base.model = {
    treatments: {},
    images: {}
};

BLR.base.compileTemplates = function() {
    for (let t in BLR.base.templates.wholes) {
        Mustache.parse(BLR.base.templates.wholes[t]);
    }

    for (let t in BLR.base.templates.partials) {
        Mustache.parse(BLR.base.templates.partials[t]);
    }
};

BLR.base.init = function() {
    BLR.base.compileTemplates();
    BLR.utils.addEvents();
    BLR.utils.linkLoad();
};