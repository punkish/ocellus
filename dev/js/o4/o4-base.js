if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};
if (!('base' in O)) O.base = {};

O.base.dom = {
    panels: document.querySelectorAll('.panel'),
    modals: document.querySelectorAll('.modal'),
    resources: document.querySelectorAll('.resource'),
    headerContainer: document.querySelector('header'),

    header: document.querySelector('#header'),
    index: document.querySelector('#index'),
    throbber: document.querySelector('#throbber'),

    fs: document.querySelector('#fs-container'),
    fsInput: document.querySelector('#fs input'),

    form: document.querySelector('form'),
    q: document.querySelector('form input[name=q]'),
    go: document.querySelector('form input[name=go]'),
    resourceSelector: document.querySelector('form > nav'),
    urlFlagSelectors: document.querySelectorAll('form .urlFlag'),
    communitiesSelectorArrow: document.querySelector('form .arrow-down'),
    communitiesSelector: document.querySelector('form .drop-down'),
    communityCheckBoxes: document.querySelectorAll('form input[name=communities]'),
    refreshCacheSelector: document.querySelector('form input[name=refreshCache]'),
    refreshCacheWarning: document.querySelector('form .refreshCacheWarning'),

    simpleSearchContainer: document.querySelector('#ss-container'),
    fancySearchContainer: document.querySelector('#fs-container'),
    toggleSearchLink: document.querySelector('#toggleSearch > a'),
    toggleGridLink: document.querySelector('#toggleGrid > a'),

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

    carousel: {
        section: document.querySelector('#carousel'),
        searchCriteria: document.querySelector('#carousel .searchCriteria'),
        results: document.querySelector('#carousel .results')
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

O.base.templates = {

    partials: {
        'template-pager': document.querySelector('#template-pager').innerHTML,
        'template-records-found': document.querySelector('#template-records-found').innerHTML,
        'template-figures': document.querySelector('#template-figures').innerHTML,
        'template-kein-preview': document.querySelector('#template-kein-preview').innerHTML
    },

    wholes: {
        // treatments: document.querySelector('#template-treatments').innerHTML,
        // treatment: document.querySelector('#template-treatment').innerHTML,
        images: document.querySelector('#template-images').innerHTML,
        carousel: document.querySelector('#template-carousel').innerHTML
    }
};

// O.base.fs.doSomethingWithQuery = function(query) {
    
//     const valid = O.default.search.fancy.params.map(e => e.key);
//     const s = [];
//     for (let k in query) {
//         if (valid.includes(k)) {
//             s.push(k + '=' + query[k]);
//         }
//     }

//     const q = s.join('&');
//     log.info(`q: ${q}`);

//     const page = document.querySelector('input[name=page]').value;
//     const size = document.querySelector('input[name=size]').value;
    
//     let uri = `${O.base.zenodeo}/v2/images?${q}&page=${page}&size=${size}`;

//     if (document.querySelector('input[name=refreshCache]').checked) {
//         const refreshCache = document.querySelector('input[name=refreshCache]').value;
//         uri += `&refreshCache=${refreshCache}`;
//     }

//     O.images.getImages(uri);
// };

O.base.modals = Array.from(O.base.dom.modals).map(m => m.id);

O.base.resources = Array.from(O.base.dom.resources).map(m => m.id);

O.base.resource = '';

O.base.figcaptions = []; 
O.base.savedPanel = {
    id: '',
    search: ''
};

O.base.model = {
    treatments: {},
    images: {}
};

O.base.compileTemplates = function() {
    log.info('compiling whole templates');
    for (let t in O.base.templates.wholes) {
        Mustache.parse(O.base.templates.wholes[t]);
    }

    log.info('compiling partial templates');
    for (let t in O.base.templates.partials) {
        Mustache.parse(O.base.templates.partials[t]);
    }
};

O.base.init = function() {

    // prepare templates
    O.base.compileTemplates();

    // add events to everything other than search
    O.utils.addEvents();

    O.utils.loadpage();

};