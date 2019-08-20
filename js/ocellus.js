/*! 2019-08-20 */
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
    accessToken: 'pk.eyJ1IjoicHVua2lzaCIsImEiOiJjajhvOXY0dW8wMTA3MndvMzBlamlhaGZyIn0.3Ye8NRiiGyjJ1fud7VbtOA'
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
if (typeof(OCELLUS) === 'undefined' || typeof(OCELLUS) !== 'object') {
    OCELLUS = {};
}

OCELLUS.modalOpen = function(event) {
    event.stopPropagation();
    event.preventDefault();

    for (let i = 0, j = OCELLUS.saveable.length; i < j; i++) {
        
        const s = document.getElementById(OCELLUS.saveable[i]);

        // is any of the saveable panel 'on'?
        if (s.classList.contains('visible')) {

            // yes, so save it for later
            OCELLUS.savedState = OCELLUS.saveable[i];

            // now turn it off
            OCELLUS.turnOff(s);
            break;
        }
    }

    // close all modals
    OCELLUS.toggle(OCELLUS.dom.panels, 'off');

    const id = event.target.hash.substr(1);
    OCELLUS.toggle(OCELLUS.dom[id], 'on');
};

OCELLUS.modalClose = function(event) {
    event.stopPropagation();
    event.preventDefault();

    const id = event.target.hash.substr(1);
    OCELLUS.toggle(OCELLUS.dom[id], 'off');

    // is a panel already in a savedState? if yes, turn it 'on'
    if (OCELLUS.savedState) {
        const s = document.getElementById(OCELLUS.savedState);
        OCELLUS.turnOn(s);
        OCELLUS.savedState = null;
    }
};

OCELLUS.addEvents = function(elements, func) {
    const len = elements.length;

    if (len > 1) {
        for (let i = 0, j = len; i < j; i++) {
            elements[i].addEventListener('click', func);
        }
    }
    else {
        elements.addEventListener('click', func);
    }
};

OCELLUS.turnOff = function(element) {
    element.classList.remove('visible'); 
    element.classList.add('hidden');
};

OCELLUS.turnOn = function(element) {
    element.classList.add('visible');
    element.classList.remove('hidden');
};

OCELLUS.toggle = function(elements, state) {
    const len = elements.length;

    if (state === 'on') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                OCELLUS.turnOn(elements[i]);
            }
        }
        else {
            OCELLUS.turnOn(elements);
        }
    }
    else if (state === 'off') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                OCELLUS.turnOff(elements[i]);
            }
        }
        else {
            OCELLUS.turnOff(elements);
        }
    }
};
if (typeof(OCELLUS) === 'undefined' || typeof(OCELLUS) !== 'object') {
    OCELLUS = {};
}

OCELLUS.getImages = function(queryObj, search, uri) {

    fetch(uri)
        .then(OCELLUS.fetchReceive)
        .then(function(res) {

            const data = res.value;

            OCELLUS.model.images.resource = 'images';
            OCELLUS.model.images['records-found'] = data.recordsFound;
            OCELLUS.model.images.statistics = data.statistics;

            OCELLUS.model.images['search-criteria'] = OCELLUS.formatSearchCriteria(data.whereCondition);
            
            [OCELLUS.model.images.figures, OCELLUS.model.images.imagesFound] = makeLayout(data.images);
            
            makePager(OCELLUS.model.images, search, queryObj.page);
            OCELLUS.model.images['records-found'] = niceNumbers(xh.value.recordsFound);

            OCELLUS.dom.images.innerHTML = Mustache.render(
                OCELLUS.templates.images, 
                OCELLUS.model.images, 
                OCELLUS['template-partials']
            );   

            OCELLUS.statsChart(OCELLUS.model.images.statistics);
            
            const figs = document.querySelectorAll('figcaption > a');
            for (let i = 0, j = figs.length; i < j; i++) {
                figs[i].addEventListener('click', OCELLUS.toggleFigcaption);
            }

            const carousel = document.querySelectorAll('.carousel');
            for (let i = 0, j = carousel.length; i < j; i++) {
                carousel[i].addEventListener('click', function(event) {
                    turnCarouselOn(OCELLUS.model.images, OCELLUS.model.images.figures[i].recId);
                });
            }
            
            OCELLUS.toggle(OCELLUS.dom.throbber, 'off');
            OCELLUS.toggle(OCELLUS.dom.images, 'on');
        });
};
if (typeof(OCELLUS) === 'undefined' || typeof(OCELLUS) !== 'object') {
    OCELLUS = {};
}

OCELLUS.getOneTreatment = function(uri, search) {
    
    fetch(uri)
        .then(OCELLUS.fetchReceive)
        .then(function(res) {    
            OCELLUS.model.treatment = res.value;

            if (uri.indexOf('xml') > -1) {
                return OCELLUS.model.treatment;
            }

            else {
                OCELLUS.model.treatment.imgCount = OCELLUS.niceNumbers(OCELLUS.model.treatment.imgCount);
                OCELLUS.model.treatment.zenodeo = OCELLUS.zenodeo;

                if (OCELLUS.model.treatment['related-records'].materialsCitations.length) {
                    OCELLUS.model.treatment.materialsCitations = OCELLUS.model.treatment['related-records'].materialsCitations;
                    OCELLUS.model.treatment.mapState = 'open';
                }

                if (OCELLUS.model.treatment['related-records'].bibRefCitations.length) {
                    OCELLUS.model.treatment.bibRefCitations = OCELLUS.model.treatment['related-records'].bibRefCitations;
                    OCELLUS.model.treatment.bibRefCitationsState = 'open';
                }

                if (OCELLUS.model.treatment['related-records'].figureCitations.length) {
                    OCELLUS.model.treatment.figureCitations = OCELLUS.model.treatment['related-records'].figureCitations;
                    OCELLUS.model.treatment.figureCitationsState = 'open';
                }

                if (OCELLUS.model.treatment['related-records'].treatmentAuthors.length) {
                    OCELLUS.model.treatment.treatmentAuthors = OCELLUS.model.treatment['related-records'].treatmentAuthors;
                    OCELLUS.model.treatment.treatmentAuthorsList = OCELLUS.formatAuthorsList(OCELLUS.model.treatment['related-records'].treatmentAuthors);
                }
                
                OCELLUS.dom.treatments.innerHTML = Mustache.render(
                    OCELLUS.templates.treatment, 
                    OCELLUS.model.treatment,
                    OCELLUS['template-partials']
                );        

                if (OCELLUS.model.treatment.imgCount !== 'Zero') {
                    const figs = document.querySelectorAll('figcaption > a');
                    // const reporters = document.querySelectorAll('.report');
                    // const submitters = document.querySelectorAll('.submit');
                    // const cancellers = document.querySelectorAll('.cancel');
                    
                    for (let i = 0, j = figs.length; i < j; i++) {
                        figs[i].addEventListener('click', OCELLUS.toggleFigcaption);
                        // reporters[i].addEventListener('click', toggleReporter);
                        // submitters[i].addEventListener('click', submitReporter);
                        // cancellers[i].addEventListener('click', cancelReporter);
                    }
                }

                if (OCELLUS.model.treatment['related-records'].materialsCitations.length) {
                    //document.querySelector('#map').classList.add('show');
                    OCELLUS.makeMap(OCELLUS.model.treatment.materialsCitations);
                }

                OCELLUS.toggle(OCELLUS.dom.throbber, 'off');
                OCELLUS.toggle(OCELLUS.dom.treatments, 'on');
            }

        });
};

OCELLUS.getManyTreatments = function(uri, search) {

    fetch(uri)
        .then(OCELLUS.fetchReceive)
        .then(function(res) {
            OCELLUS.model.treatments = res.value;

            if (OCELLUS.model.treatments['num-of-records']) {

                OCELLUS.model.treatments.resource = 'treatments';

                if (OCELLUS.model.treatments['num-of-records'] > 0) {
                    if (OCELLUS.model.treatments.records && OCELLUS.model.treatments.records.length) {
                        OCELLUS.model.treatments.successful = true;
                        OCELLUS.model.treatments['num-of-records'] = OCELLUS.niceNumbers(OCELLUS.model.treatments['num-of-records']);
                        OCELLUS.model.treatments.from = OCELLUS.niceNumbers(OCELLUS.model.treatments.from);

                        if (OCELLUS.model.treatments.to < 10) {
                            OCELLUS.model.treatments.to = OCELLUS.niceNumbers(OCELLUS.model.treatments.to).toLowerCase();
                        }
                        
                        OCELLUS.model.treatments['search-criteria-text'] = OCELLUS.formatSearchCriteria(OCELLUS.model.treatments['search-criteria']);
                        OCELLUS.makePager(OCELLUS.model.treatments, search, false);
                    }
                    else {
                        OCELLUS.model.treatments.successful = false;
                    }
                    
                    OCELLUS.dom.treatments.innerHTML = Mustache.render(
                        OCELLUS.templates.treatments, 
                        OCELLUS.model.treatments,
                        OCELLUS['template-partials']
                    );

                    const tabs = new Tabs({ elem: "tabs", open: 0 });
                    OCELLUS.statsChart(OCELLUS.model.treatments.statistics);
                    OCELLUS.dom.q.placeholder = `search ${OCELLUS.model.treatments['num-of-records']} treatments`;
                }
                else {
                    OCELLUS.model.treatments.successful = false;
                    OCELLUS.model.treatments['num-of-records'] = 'No';

                    OCELLUS.dom.treatments.innerHTML = Mustache.render(
                        OCELLUS.templates.treatments, 
                        OCELLUS.model.treatments,
                        OCELLUS['template-partials']
                    );
                }

            }

            OCELLUS.toggle(OCELLUS.dom.throbber, 'off');
            OCELLUS.toggle(OCELLUS.dom.treatments, 'on');

        });
};

OCELLUS.getTreatments = function(queryObj, search, uri) {

    // single treatment
    if (queryObj.treatmentId) {
        console.log('getting a single treatment ' + queryObj.treatmentId);
        OCELLUS.getOneTreatment(uri, search);
    }
    
    // many treatments
    else {
        console.log('getting many treatments from ' + uri);
        OCELLUS.getManyTreatments(uri, search);
    }
};

OCELLUS.makeMap = function(mcs) {

    // initialize the map and add the layers to it
    const mcmap = L.map('map', {
        center: [0, 0],
        zoom: 8,
        scrollWheelZoom: false
    });

    L.tileLayer(OCELLUS.map.url, {
        attribution: OCELLUS.map.attribution,
        maxZoom: 18,
        id: OCELLUS.map.id,
        accessToken: OCELLUS.map.accessToken
    }).addTo(mcmap);

    // https://stackoverflow.com/questions/16845614/zoom-to-fit-all-markers-in-mapbox-or-leaflet
    const markers = [];
    mcs.forEach(mc => {
        if (mc.latitude && mc.longitude) {
            const marker = L.marker([mc.latitude, mc.longitude]).addTo(mcmap);
            marker.bindPopup(mc.typeStatus);
            markers.push(marker)
        }
    })

    const bounds = new L.featureGroup(markers).getBounds();
    mcmap.fitBounds(bounds);
}
if (typeof(OCELLUS) === 'undefined' || typeof(OCELLUS) !== 'object') {
    OCELLUS = {};
}

OCELLUS.statsChart = function(statistics) {

    // Disable automatic style injection
    Chart.platform.disableCSSInjection = true;

    const charts = document.querySelectorAll('.chart');

    /*
    statistics = [
        {
            'chart-name': 'Chart one',
            'x-axis': {
                name: 'materials citations',
                values: []
            },
            'y-axis': {
                name: 'collecting codes',
                values: []
            }
        }
    ]
    */

    for (let i = 0, j = charts.length; i < j; i++) {
        const ctx = charts[i].getContext('2d');
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statistics[i]['x-axis'].values,
                datasets: [{
                    label: statistics[i]['chart-name'],
                    data: statistics[i]['y-axis'].values,
                    datalabels: { color: '#000000' },
                    backgroundColor: '#ff0000',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: { beginAtZero: true }
                    }],
                    xAxes: [{
                        scaleLabel: { fontSize: 8 }
                    }]
                },
                responsive: true,
                tooltips: { enabled: false },
                legend: { display: false }
            }
        });
    }
};

OCELLUS.niceNumbers = function(num) {
    if (num < 10) {
        return ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine'][num];
    }
    else {
        return num;
    }
};

OCELLUS.formatSearchCriteria = function(queryObject) {

    function str(el) {
        if (el[0] === 'q') {
            return `<span class='crit-val'>${el[1]}</span> is in the <span class='crit-key'>text</span>`
        }
        else {
            return `<span class='crit-key'>${el[0]}</span> is <span class='crit-val'>${el[1]}</span>`
        }
    }

    const remove = ['id', 'size', 'communities', 'page'];
    remove.forEach(e => { if (Object.keys(queryObject).indexOf(e) > -1) { delete(queryObject[e]) }})

    let c = '';
    const el = Object.entries(queryObject);
    const l = el.length;
    if (l === 1) {
        c += str(el[0]);
    }
    else if (l === 2) {
        c += `${str(el[0])} and ${str(el[1])}`;
    }
    else {
        const ab = el.slice(0, l - 1);
        const last = el[l - 1];
        c += ab.map(e => str(e)).join(', ') + ' and ' + str(last);
    }

    return c;
};

OCELLUS.formatAuthorsList = function(treatmentAuthors) {

    let c = '';
    const l = treatmentAuthors.length;
    if (l === 1) {
        c += treatmentAuthors[0].author
    }
    else if (l === 2) {
        c += `${treatmentAuthors[0].author} and ${treatmentAuthors[1].author}`;
    }
    else {
        const ab = treatmentAuthors.slice(0, l - 1);
        const last = treatmentAuthors[l - 1].author;
        c += ab.map(e => e.author).join(', ') + ' and ' + last;
    }

    return c;
};

OCELLUS.makeUris = function (queryObj, setHistory = true) {

    let hrefArray1 = [];
    let hrefArray2 = [];

    for (let p in queryObj) {

        // We don't want to send 'resource' to Zenodeo
        // because 'resource' is already in the uri
        if (p !== 'resource') {
            hrefArray1.push(p + '=' + queryObj[p]);
        }

        // We don't want 'refreshCache' in the browser
        // address bar
        if (p !== 'refreshCache') {
            hrefArray2.push(p + '=' + queryObj[p]);
        }
    }

    const uri = `${OCELLUS.zenodeo}/v2/${queryObj.resource}?${hrefArray1.join('&')}`;

    const search = hrefArray2.join('&');

    if (setHistory) {
        history.pushState('', '', `?${hrefArray2.join('&')}`);
    }
    
    return {
        search: search,
        uri: uri
    }

};

OCELLUS.getResource = function(queryObj) {
    const {search, uri} = OCELLUS.makeUris(queryObj);

    if (queryObj.resource === 'treatments') {
        OCELLUS.getTreatments(queryObj, search, uri);
    }
    else if (queryObj.resource === 'images') {
        OCELLUS.getImages(queryObj, search, uri);
    }
};

OCELLUS.syntheticData = function(resource, queryObj) {
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    const alpha = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

    function getRandomString(len) {
        let s = '';
        for (let i = 0; i < len; i++) {
            s += alpha[getRandomInt(26)]
        }

        return s;
    }

    resource.statistics = {
        'below 10': 0,
        '10 to 50': 0,
        'above 50': 0
    }

    const numOfRecords = getRandomInt(100);
    for (let i = 0; i < numOfRecords; i++) {
        const age = getRandomInt(100);
        resource.data.push({name: getRandomString(getRandomInt(10)), age: age});
        if (age < 10) {
            resource.statistics['below 10']++;
        }
        else if (age > 50) {
            resource.statistics['above 50']++;
        }
        else {
            resource.statistics['10 to 50']++;
        }
    }

    resource['records-found'] = OCELLUS.niceNumbers(numOfRecords);
    resource.resource = 'treatments';
    
    resource['search-criteria'] = OCELLUS.formatSearchCriteria(queryObj);

    resource.successful = true;
    resource.from = 'One';
    resource.to = 30;
};

OCELLUS.fetchReceive = function(response) {
    if (!response.ok) {
        throw new Error('HTTP error, status = ' + response.status);
    }

    return response.json();
};

OCELLUS.isXml = function(s) {
    if (s.length === 32) {
        return true;
    }

    return false;
};

OCELLUS.urlDeconstruct = function(s) {
    
    // remove any leading '?'
    if (s.substr(0, 1) === '?') {
        s = s.substr(1);
    }

    const queryObject = {};
    s.split('&').forEach(p => { r = p.split('='); queryObject[r[0]] = r[1] });
    if (queryObject.q) {
        q.value = queryObject.q;
    }

    const rtLabels = OCELLUS.dom.resourceSelector.querySelectorAll('label');
    const rtInputs = OCELLUS.dom.resourceSelector.querySelectorAll('input');

    for (let i = 0; i < rtLabels.length; i++) {
        if (queryObject.resource === rtInputs[i].value) {
            rtLabels[i].classList.add('searchFocus');
        }
        else {
            rtLabels[i].classList.remove('searchFocus');
        }
    }

    return queryObject;
};

OCELLUS.urlConstruct = function() {

    const queryObject = {};

    const inputs = OCELLUS.dom.inputs;
    for (let i = 0, j = inputs.length; i < j; i++) {
        const input = inputs[i];
        if (input.type === 'radio' || input.type === 'checkbox') {
            if (input.checked) {
                queryObject[input.name] = input.value;
            }
        }
        else {
            queryObject[input.name] = input.value;
        }
    }

    if (queryObject.resource === 'images') {
        queryObject.access_right = 'open';
    }

    queryObject.page = 1;
    queryObject.id = 0;

    return queryObject;
};

OCELLUS.makePager = function(data, search) {

    if (search.substr(0, 1) === '?') {
        search = search.substr(1);
    }

    const queryObject = {};
    search.split('&').forEach(p => { r = p.split('='); queryObject[r[0]] = r[1] });

    if (data['num-of-records'] && (data['num-of-records'] >= OCELLUS.size)) {
        data.prev = '?' + search.replace(/page=\d+/, `page=${data.prevpage}`);
        data.next = '?' + search.replace(/page=\d+/, `page=${data.nextpage}`);
    }

    data.pager = true;
    return data;
};

OCELLUS.goGetIt = function(event) {

    if (!location.search && OCELLUS.dom.q.value === '') {

        // neither is there an event, that is, nothing has
        // been clicked, nor there are any search params, 
        // that is, we are not trying to load a preformed 
        // URL sent by someone. This means something is not 
        // right. In this case, default to a blank form
        OCELLUS.toggle(OCELLUS.dom.panels, 'off');
        OCELLUS.dom.q.placeholder = "c’mon, enter something";
        return false;
    }
    else {
        
        let qp;
        if (event) {

            event.preventDefault();
            event.stopPropagation();

            // construct URL based on form fields
            qp = OCELLUS.urlConstruct(OCELLUS.dom.form);
        }
        else if (location.search) {
    
            // deconstruct URL based on location.search
            qp = OCELLUS.urlDeconstruct(location.search);
        }

        OCELLUS.toggle(OCELLUS.dom.throbber, 'on');
        OCELLUS.getResource(qp);
    }
};

OCELLUS.toggleRefreshCache = function(event) {
    OCELLUS.dom.refreshCacheWarning.classList.toggle('show');
};

OCELLUS.toggleCommunities = function(event) {
    OCELLUS.dom.communitiesSelector.classList.toggle('open');
};

OCELLUS.toggleFigcaption = function(event) {

    // find and store all the figcaptions on the page in 
    // an array. This is done only once since figcaptions 
    // is a global var
    if (OCELLUS.figcaptions.length == 0) {
        OCELLUS.figcaptions = document.querySelectorAll('figcaption');
    }

    let fc = this.parentElement.style.maxHeight;
    
    if (fc === OCELLUS.figcaptionHeight || fc === '') {
        let i = 0;
        for (; i < OCELLUS.figcaptions.length; i++) {
            OCELLUS.figcaptions[i].style.maxHeight = OCELLUS.figcaptionHeight;
        }

        this.parentElement.style.maxHeight =  '100%';
        this.parentElement.style.overflow = 'auto';
    }
    else {
        this.parentElement.style.maxHeight =  OCELLUS.figcaptionHeight;
        this.parentElement.style.overflow = 'hidden';
    }
};

OCELLUS.suggest = function(field) {
    new autoComplete({
        selector: field,
        minChars: 3,
        source: function(term, response) {
            try { fetch.abort() } catch(e) {}
            fetch(`${zenodeo}/v2/families?q=${term}`)
                .then(OCELLUS.fetchReceive)
                .then(response);
        }
    });
};

OCELLUS.activateUrlFlagSelectors = function() {
    for (let i = 0, j = OCELLUS.dom.urlFlagSelectors.length; i < j; i++) {

        const element = OCELLUS.dom.urlFlagSelectors[i];
        element.addEventListener('click', function(event) {
    
            OCELLUS.chooseUrlFlags(element);
            
            if (element.name === 'communities') {
                OCELLUS.dom.communitiesSelector.classList.remove('open');
            }
    
        })
    }
};

OCELLUS.chooseUrlFlags = function (element) {

    if (element.name === 'communities') {

        if (element.value === 'all communities') {

            const j = OCELLUS.dom.communityCheckBoxes.length;
            if (element.checked === true) {
                for (let i = 0; i < j; i++) {
                    OCELLUS.dom.communityCheckBoxes[i].checked = true;
                }
            }
            else {
                for (let i = 0; i < j; i++) {
                    if (OCELLUS.dom.communityCheckBoxes[i].value !== 'all communities') {
                        OCELLUS.dom.communityCheckBoxes[i].checked = false;
                    }
                }
            }

        }
        else {

            // uncheck 'all communities'
            OCELLUS.dom.allCommunities.checked = false;
        }
    }
    else if (element.name === 'resource') {

        const rtLabels = OCELLUS.dom.resourceSelector.querySelectorAll('label');
        const rtInputs = OCELLUS.dom.resourceSelector.querySelectorAll('input');

        for (let i = 0; i < rtLabels.length; i++) {
            if (element.value === rtInputs[i].value) {
                rtLabels[i].classList.add('searchFocus');
                OCELLUS.getResource({resource: rtInputs[i].value, stats: true});
            }
            else {
                rtLabels[i].classList.remove('searchFocus');
            }
        }
    }
    else if (element.name === 'refreshCache') {
        element.value = element.checked;
    }

};
//# sourceMappingURL=ocellus.js.map