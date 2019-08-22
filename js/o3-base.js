if (typeof(OCELLUS) === 'undefined' || typeof(OCELLUS) !== 'object') {
    OCELLUS = {};
}

OCELLUS.templates = {

    // start: partials //////////////////////
    pager: document.querySelector('#template-pager').innerHTML,
    'records-found': document.querySelector('#template-records-found').innerHTML,
    charts: document.querySelector('#template-charts').innerHTML,
    figures: document.querySelector('#template-figures').innerHTML,
    // end: partials //////////////////////

    treatments: document.querySelector('#template-treatments').innerHTML,
    treatment: document.querySelector('#template-treatment').innerHTML,
    images: document.querySelector('#template-images').innerHTML
};

OCELLUS['template-partials'] = {};

OCELLUS.figcaptionHeight = '30px';
OCELLUS.figcaptions = [];

OCELLUS.compileTemplates = function() {
    for (let t in OCELLUS.templates) {
        Mustache.parse(OCELLUS.templates[t]);
    }

    OCELLUS['template-partials']['template-pager'] = OCELLUS.templates.pager;
    OCELLUS['template-partials']['template-records-found'] = OCELLUS.templates['records-found'];
    OCELLUS['template-partials']['template-charts'] = OCELLUS.templates.charts;
    OCELLUS['template-partials']['template-figures'] = OCELLUS.templates.figures;
};

OCELLUS.dom = {

    // modals
    maintenance: document.querySelector('#maintenance'),
    about: document.querySelector('#about'),
    privacy: document.querySelector('#privacy'),
    ip: document.querySelector('#ip'),
    contact: document.querySelector('#contact'),
    panels: document.querySelectorAll('.panel'),
    modalOpen: document.querySelectorAll('.modal-open'),
    modalClose: document.querySelectorAll('.modal-close'),
    throbber: document.querySelector('#throbber'),

    // form elements
    form: document.querySelector('form[name=simpleSearch]'),
    inputs: document.querySelectorAll('form[name=simpleSearch] input'),
    q: document.querySelector('#q'),
    urlFlagSelectors: document.querySelectorAll('.urlFlag'),
    resourceSelector: document.querySelector('#resourceSelector'),
    goGetIt: document.querySelector('#go-get-it'),
    communitiesSelector: document.querySelector('.drop-down'),
    communityCheckBoxes: document.querySelectorAll('input[name=communities]'),
    allCommunities: document.querySelector('input[value="all communities"]'),
    refreshCacheSelector: document.querySelector('input[name=refreshCache]'),
    urlFlagSelectors: document.querySelectorAll('.urlFlag'),

    // results panels
    treatments: document.querySelector('#treatments'),
    bigmap: document.querySelector('#bigmap')
};

OCELLUS.saveable = ['treatments'],

OCELLUS.savedState = null;

OCELLUS.model = {
    treatments: {},
    treatment: {},
    images: {}
}

OCELLUS.size = 30;

OCELLUS.map = {
    url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicHVua2lzaCIsImEiOiJjajhvOXY0dW8wMTA3MndvMzBlamlhaGZyIn0.3Ye8NRiiGyjJ1fud7VbtOA',
    leaflet: {}
};

OCELLUS.init = function(state) {
    const {maintenance} = state || {maintenance: false};
    
    // make sure all panels are hidden
    OCELLUS.toggle(OCELLUS.dom.panels, 'off');

    if (maintenance) {
        OCELLUS.toggle(OCELLUS.dom.maintenance, 'on');
        return;
    }
    else {
        OCELLUS.addEvents(OCELLUS.dom.modalOpen, OCELLUS.modalOpen);
        OCELLUS.addEvents(OCELLUS.dom.modalClose, OCELLUS.modalClose);
        OCELLUS.addEvents(OCELLUS.dom.goGetIt, OCELLUS.goGetIt);
        OCELLUS.addEvents(OCELLUS.dom.communitiesSelector, OCELLUS.toggleCommunities);
        OCELLUS.addEvents(OCELLUS.dom.refreshCacheSelector, OCELLUS.toggleRefreshCache);
        OCELLUS.suggest(OCELLUS.dom.q);
        OCELLUS.activateUrlFlagSelectors();

        OCELLUS.compileTemplates();

        if (location.search) {
            //console.log('getting results based on location')
            OCELLUS.goGetIt();
        }
        else {
            //console.log('getting stats')
            OCELLUS.getResource({resource: 'treatments'});
            OCELLUS.dom.q.focus();
        }
    }
};

/*
map = {
    base: [
        'templates',
        'template-partials',
        'compileTemplates',
        'dom',
        'saveable',
        'model',
        'size',
        'init'
    ],

    utils: [
        'statsChart',
        'niceNumbers',
        'formatSearchCriteria',
        'makeUris',
        'getResource',
        'syntheticData',
        'fetchReceive',
        'isXml',
        'urlDeconstruct',
        'urlConstruct',
        'makePager',
        'goGetIt'
    ],

    treatments: [
        'getOneTreatment',
        'getManyTreatments',
        'getTreatments',
        'makeMap'
    ],

    eventlisterners: [
        'modalOpen',
        'modalClose',
        'addEvents',
        'turnOff',
        'turnOn',
        'toggle'
    ]
}
*/