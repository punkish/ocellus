/*! 2019-10-14 */
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
if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('eventlisteners' in BLR)) BLR.eventlisteners = {};

// BLR.eventlisteners = {};

BLR.eventlisteners.openModal = function(event) {
    event.stopPropagation();
    event.preventDefault();

    BLR.utils.turnOffAll();

    // turn on the requested modal
    const id = event.target.href.split('/').pop().split('.')[0];

    BLR.utils.turnOnById(id);
    history.pushState('', '', `${id}.html`);
};

BLR.eventlisteners.toggle = function(elements, state) {
    const len = elements.length;

    if (state === 'on') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                BLR.utils.turnOn(elements[i]);
            }
        }
        else {
            BLR.utils.turnOn(elements);
        }
    }
    else if (state === 'off') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                BLR.utils.turnOff(elements[i]);
            }
        }
        else {
            BLR.utils.turnOff(elements);
        }
    }
};

BLR.eventlisteners.toggleCommunities = function(event) {
    BLR.base.dom.communitiesSelector.classList.toggle('open');
};

BLR.eventlisteners.toggleRefreshCache = function(event) {
    BLR.base.dom.refreshCacheWarning.classList.toggle('show');
};

BLR.eventlisteners.closeModal = function(event) {
    event.stopPropagation();
    event.preventDefault();

    // turn off all visible modals
    for (let i = 0, j = BLR.base.dom.modals.length; i < j; i++) {
        if (BLR.base.dom.modals[i].classList.contains('visible')) {
            BLR.utils.turnOff(BLR.base.dom.modals[i]);
        }
    }

    // if a panel is saved, turn it on
    if (BLR.base.savedPanel.id) {        
        BLR.utils.turnOnById(BLR.base.savedPanel.id);
        let uri = `${BLR.base.savedPanel.id}.html` + (BLR.base.savedPanel.search || '');
        history.pushState('', '', uri);
    }
    else {
        BLR.utils.turnOnById('index');
        history.pushState('', '', 'index.html');
    }
};

BLR.eventlisteners.goHome = function(event) {
    event.stopPropagation();
    event.preventDefault();

    BLR.utils.turnOffAll();
    BLR.utils.turnOnById('index');
    BLR.base.dom.q.value = '';
    history.pushState('', '', 'index.html');
};

BLR.eventlisteners.activateUrlFlagSelectors = function() {
    for (let i = 0, j =  BLR.base.dom.urlFlagSelectors.length; i < j; i++) {

        const element = BLR.base.dom.urlFlagSelectors[i];
        element.addEventListener('click', function(event) {
    
            BLR.utils.chooseUrlFlags(element);
            
            if (element.name === 'communities') {
                BLR.base.dom.communitiesSelector.classList.remove('open');
            }
    
        })
    }
};

BLR.eventlisteners.goGetIt = function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    if (BLR.utils.formHasNoValidInput()) {

        // warn and exit if input fields are empty
        BLR.base.dom.q.placeholder = "c’mon, enter something";
        return;
    }

    // construct browser URI from fields
    const browserUri = BLR.utils.makeBrowserUri();
    history.pushState('', '', browserUri);

    // construct Zenodeo URI from fields
    const zenodeoUri = BLR.utils.makeZenodeoUriFromInputs();
    BLR.utils.loadResource(zenodeoUri);
};

BLR.eventlisteners.toggleFigcaption = function(event) {

    // find and store all the figcaptions on the page in 
    // an array. This is done only once since figcaptions 
    // is a global var
    if (BLR.base.figcaptions.length == 0) {
        BLR.base.figcaptions = document.querySelectorAll('figcaption');
        //figcaptionLength = BLR.base.figcaptions.length;
    }

    let fc = this.parentElement.style.maxHeight;
    
    if (fc === BLR.base.figcaptionHeight || fc === '') {
        let i = 0;
        for (; i < BLR.base.figcaptions.length; i++) {
            BLR.base.figcaptions[i].style.maxHeight = BLR.base.figcaptionHeight;
        }

        this.parentElement.style.maxHeight =  '100%';
        this.parentElement.style.overflow = 'auto';
    }
    else {
        this.parentElement.style.maxHeight =  BLR.base.figcaptionHeight;
        this.parentElement.style.overflow = 'hidden';
    }
    
};
if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('images' in BLR)) BLR.images = {};

BLR.images.makeLayout = function(records) {
    let figures = [];
    for (let i = 0, j = records.length; i < j; i++) {
        const figure = {
            title: records[i].title,
            creators: records[i].creators ? records[i].creators.map(c => c.name) : [],
            recId: records[i].id,
            zenodoRecord: BLR.base.zenodo + records[i].id,
            description: records[i].description,
            doi: records[i].doi,
            imgBlur: records[i].thumbs['10'],
            img50: records[i].thumbs['50'],
            img100: records[i].thumbs['100'],
            img250: records[i].thumbs['250'],
            img750: records[i].thumbs['750'],
            image1200: records[i].thumbs['1200']
        };
        
        figures.push(figure)
    }

    return figures;
};

BLR.images.turnCarouselOn = function(data, recId) {

    BLR.base.dom.carousel.innerHTML = Mustache.render(tmplCarousel, data);
    BLR.base.dom.wrapper.classList.remove('show');
    BLR.base.dom.carouselContainer.classList.add('show');

    const carouselOff = document.querySelectorAll('.carouselOff');
    for (let i = 0, j = carouselOff.length; i < j; i++) {
        carouselOff[i].addEventListener('click', turnCarouselOff);
    }
    
    const newhash = '#' + recId;
    if (history.pushState) {
        history.pushState(null, null, newhash);
    }
    else {
        location.hash = newhash;
    }
};

BLR.images.turnCarouselOff = function(event) {
    BLR.base.dom.wrapper.classList.add('show');
    BLR.base.dom.carouselContainer.classList.remove('show');
};

BLR.images.getImages = function(uri) {

    fetch(uri)
        .then(BLR.utils.fetchReceive)
        .then(function(res) {

            if (res.value) {
                BLR.base.model.images = res.value;
            }
            else if (res['num-of-records']) {
                BLR.base.model.images = res;
            }
            

            if (BLR.base.model.images['num-of-records']) {

                BLR.base.model.images.resource = 'images';

                if (BLR.base.model.images['num-of-records'] > 0) {
                    if (BLR.base.model.images['num-of-records']) {
                        BLR.base.model.images.successful = true;
                        BLR.base.model.images['num-of-records'] = BLR.utils.niceNumbers(BLR.base.model.images['num-of-records']);
                        BLR.base.model.images.from = BLR.utils.niceNumbers(BLR.base.model.images.from);

                        if (BLR.base.model.images.to < 10) {
                            BLR.base.model.images.to = BLR.utils.niceNumbers(BLR.base.model.images.to).toLowerCase();
                        }

                        BLR.base.model.images.figures = BLR.images.makeLayout(BLR.base.model.images.records)
                        
                        BLR.base.model.images['search-criteria-text'] = BLR.utils.formatSearchCriteria(
                            BLR.base.model.images['search-criteria'],
                            BLR.base.model.images['num-of-records'],
                            'images'
                        );
                        
                        BLR.utils.makePager(BLR.base.model.images);
                    }
                    else {
                        BLR.base.model.images.successful = false;
                    }
                    
                    
                    BLR.base.dom.images.results.innerHTML = Mustache.render(
                        BLR.base.templates.wholes.images, 
                        BLR.base.model.images,
                        BLR.base.templates.partials
                    );

                    
                    const figs = document.querySelectorAll('figcaption > a');
                    for (let i = 0, j = figs.length; i < j; i++) {
                        figs[i].addEventListener('click', BLR.eventlisteners.toggleFigcaption);
                    }

                    const carousel = document.querySelectorAll('.carousel');
                    for (let i = 0, j = carousel.length; i < j; i++) {
                        carousel[i].addEventListener('click', function(event) {
                            BLR.images.turnCarouselOn(data, data.figures[i].recId);
                        });
                    }
                    

                    //BLR.utils.statsChart(BLR.base.model.treatments.statistics);
                    //BLR.makeMap(BLR.model.treatments.map);
                    //const tabs = new Tabby('[data-tabs]');
         
                    //tabs.open(1);
                    
                    //BLR.base.dom.q.placeholder = `search ${BLR.base.model.treatments['num-of-records']} treatments`;
                }
                else {
                    BLR.base.model.images.successful = false;
                    BLR.base.model.images['num-of-records'] = 'No';

                    BLR.base.dom.images.results.innerHTML = Mustache.render(
                        BLR.base.templates.wholes.images, 
                        BLR.base.model.images,
                        BLR.base.templates.partials
                    );
                }

            }

            BLR.utils.turnOffAll();
            BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'off');
            BLR.eventlisteners.toggle(BLR.base.dom.images.section, 'on');
            
        });
};
if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('treatments' in BLR)) BLR.treatments = {};

BLR.treatments.getOneTreatment = function(uri) {
    fetch(uri)
        .then(BLR.utils.fetchReceive)
        .then(function(res) {    
            BLR.base.model.treatment = res.value;
            if (uri.indexOf('xml') > -1) {
                return BLR.base.model.treatment;
            }
            else {
                BLR.treatments.loadOneTreatment(BLR.base.model);
            }
        });
};

BLR.treatments.loadOneTreatment = function(data) {
    data.treatment.imgCount = BLR.utils.niceNumbers(data.treatment.imgCount);
    data.treatment.zenodeo = BLR.base.zenodeo;

    if (data.treatment['related-records'].materialsCitations.length) {
        data.treatment.materialsCitations = data.treatment['related-records'].materialsCitations;
        data.treatment.mapState = 'open';
    }

    if (data.treatment['related-records'].bibRefCitations.length) {
        data.treatment.bibRefCitations = data.treatment['related-records'].bibRefCitations;
        data.treatment.bibRefCitationsState = 'open';
    }

    if (data.treatment['related-records'].figureCitations.length) {
        data.treatment.figureCitations = data.treatment['related-records'].figureCitations;
        data.treatment.figureCitationsState = 'open';
    }

    if (data.treatment['related-records'].treatmentAuthors.length) {
        data.treatment.treatmentAuthors = data.treatment['related-records'].treatmentAuthors;
        data.treatment.treatmentAuthorsList = BLR.utils.formatAuthorsList(data.treatment['related-records'].treatmentAuthors);
    }
    
    BLR.base.dom.treatment.results.innerHTML = Mustache.render(
        BLR.base.templates.wholes.treatment, 
        data.treatment,
        BLR.base.templates.partials
    );        

    if (data.treatment.imgCount !== 'Zero') {
        const figs = document.querySelectorAll('figcaption > a');
        // const reporters = document.querySelectorAll('.report');
        // const submitters = document.querySelectorAll('.submit');
        // const cancellers = document.querySelectorAll('.cancel');
        
        for (let i = 0, j = figs.length; i < j; i++) {
            figs[i].addEventListener('click', BLR.utils.toggleFigcaption);
            // reporters[i].addEventListener('click', toggleReporter);
            // submitters[i].addEventListener('click', submitReporter);
            // cancellers[i].addEventListener('click', cancelReporter);
        }
    }

    if (data.treatment['related-records'].materialsCitations.length) {
        BLR.treatments.makeMap(data.treatment.materialsCitations);
    }
    

    BLR.utils.turnOffAll();
    BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'off');
    BLR.eventlisteners.toggle(BLR.base.dom.treatment.section, 'on');
    BLR.base.map.leaflet.invalidateSize();
};

BLR.treatments.loadManyTreatments = function(data) {
    if (data.treatments['num-of-records']) {

        data.treatments.resource = 'treatments';

        if (data.treatments['num-of-records'] > 0) {
            if (data.treatments.records && data.treatments.records.length) {
                data.treatments.successful = true;
                data.treatments['num-of-records'] = BLR.utils.niceNumbers(data.treatments['num-of-records']);
                data.treatments.from = BLR.utils.niceNumbers(data.treatments.from);

                if (data.treatments.to < 10) {
                    data.treatments.to = BLR.utils.niceNumbers(data.treatments.to).toLowerCase();
                }
                
                data.treatments['search-criteria-text'] = BLR.utils.formatSearchCriteria(
                    data.treatments['search-criteria'],
                    data.treatments['num-of-records'],
                    'treatments'
                );
                
                BLR.utils.makePager(data.treatments);
            }
            else {
                data.treatments.successful = false;
            }
            
            BLR.base.dom.treatments.results.innerHTML = Mustache.render(
                BLR.base.templates.wholes.treatments, 
                data.treatments,
                BLR.base.templates.partials
            );

            
            //BLR.utils.statsChart(data.treatments.statistics);
            //BLR.makeMap(BLR.model.treatments.map);
            //const tabs = new Tabby('[data-tabs]');
 
            //tabs.open(1);
        }
        else {
            data.treatments.successful = false;
            data.treatments['num-of-records'] = 'No';

            BLR.base.dom.treatments.results.innerHTML = Mustache.render(
                BLR.base.templates.wholes.treatments, 
                data.treatments,
                BLR.base.templates.partials
            );
        }

    }

    BLR.utils.turnOffAll();
    BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'off');
    BLR.eventlisteners.toggle(BLR.base.dom.treatments.section, 'on');
};

BLR.treatments.getManyTreatments = function(uri) {
    fetch(uri)
        .then(BLR.utils.fetchReceive)
        .then(function(res) {
            BLR.base.model.treatments = res.value;
            BLR.treatments.loadManyTreatments(BLR.base.model);
        });
};

BLR.treatments.getTreatments = function(uri) {

    // single treatment
    if (uri.indexOf('treatmentId') > -1) {
        BLR.treatments.getOneTreatment(uri);
    }
    
    // many treatments
    else {
        BLR.treatments.getManyTreatments(uri);
    }
};

BLR.treatments.makeMap = function(points) {

    // initialize the map and add the layers to it
    BLR.base.map.leaflet = L.map('map', {
        center: [0, 0],
        zoom: 2,
        scrollWheelZoom: false
    });

    const tiles = L.tileLayer(BLR.base.map.url, {
        attribution: BLR.base.map.attribution,
        maxZoom: 18,
        id: BLR.base.map.id,
        accessToken: BLR.base.map.accessToken
    }).addTo(BLR.base.map.leaflet);

    // https://stackoverflow.com/questions/16845614/zoom-to-fit-all-markers-in-mapbox-or-leaflet
    const markers = [];
    points.forEach(p => {
        if (typeof(p.latitude) === 'number' && typeof(p.longitude) === 'number') {

            const title = points.treatmentTitle;
            
            const marker = L.marker([p.latitude, p.longitude]).addTo(BLR.base.map.leaflet);
            marker.bindPopup(p.typeStatus + '<br>' + title);
            markers.push(marker)
        }
    });

    const bounds = new L.featureGroup(markers).getBounds();
    BLR.base.map.leaflet.fitBounds(bounds);
   //BLR.base.map.leaflet.addLayer(markers);
    
    

    // const bounds = new L.featureGroup(markers).getBounds();
    // console.log(foo);
    // console.log(bounds);

    // const b = [
    //     [-35.331112, 149.775],
    //     [-37.331387, 138.7475]
    // ];

    //mcmap.fitBounds(new L.featureGroup(markers).getBounds().pad(0.5));

}
if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('utils' in BLR)) BLR.utils = {};

BLR.utils.statsChart = function(resource, statistics) {

    // Disable automatic style injection
    Chart.platform.disableCSSInjection = true;
    const formatter = function(value, context) {
        if (value > 1000000) {
            return `${Math.round(value/1000000)}M`
        }
        else if (value > 1000) {
            return `${Math.round(value/1000)}K`
        }
        else {
            return value;
        } 
    };

    const charts = document.querySelectorAll(`#${resource} .chart`);
    for (let i = 0, j = charts.length; i < j; i++) {
        
        const ctx = charts[i].getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(statistics.charts[i].data),
                datasets: [{
                    label: statistics.charts[i].title,
                    data: Object.values(statistics.charts[i].data),
                    datalabels: { 
                        color: '#000000',
                        formatter: formatter
                    },
                    backgroundColor: '#ff0000',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: { 
                            beginAtZero: true,
                            callback: formatter
                        }
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

BLR.utils.niceNumbers = function(n) {
    return n > 9 ? n : ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][n];
};

BLR.utils.formatSearchCriteria = function(s, n, resource) {
    //s = s.substr(1).split('&');
    const remove = ['communities', 'refreshCache', 'size', 'page', 'go'];
    const criteria = [];
    for (let k in s) {
        if (!remove.includes(k)) {
            const v = s[k];
            if (k === 'q') {
                criteria.push(`<span class="crit-val">${v}</span> is in the text`);
            }
            else {
                criteria.push(`<span class="crit-key">${k}</span> is <span class="crit-val">${v}</span>`);
            }
        }
    }

    let l = criteria.length;
   // let sc = `${n} ${resource} found where `;
   let sc = '';

    if (l === 1) {
        sc += criteria[0];
    }
    else if (l === 2) {
        sc +=  criteria.join(' and ');
    }
    else if (l > 2) {
        l = l - 1;
        sc += criteria.slice(0, l).join(', ') + ', and ' + criteria[l];
    }
    
    return sc;
}

BLR.utils.turnOn = function(element) {
    element.classList.remove('hidden');
    element.classList.add('visible');
};

BLR.utils.turnOff = function(element) {
    element.classList.remove('visible');
    element.classList.add('hidden');
};

BLR.utils.turnOnById = function(id) {
    BLR.utils.turnOn(document.getElementById(id));
};

BLR.utils.turnOffById = function(id) {
    BLR.utils.turnOff(document.getElementById(id));
};

BLR.utils.turnOffAll = function() {

    // turn off all panels including modals and resources
    for (let i = 0, j = BLR.base.dom.panels.length; i < j; i++) {
        if (BLR.base.dom.panels[i].classList.contains('visible')) {

            // if the panel is a resource, save it for later use 
            // and then turn it off
            if (BLR.base.resources.includes(BLR.base.dom.panels[i].id) || BLR.base.dom.panels[i].id === 'index') {
                BLR.base.savedPanel.id = BLR.base.dom.panels[i].id;
                BLR.base.savedPanel.search = location.search;
            } 

            BLR.utils.turnOff(BLR.base.dom.panels[i]);
        }
    }
};

BLR.utils.addEvents = function() {
    for (let i = 0, j = BLR.base.dom['modal-open'].length; i < j; i++) {
        BLR.base.dom['modal-open'][i].addEventListener('click', BLR.eventlisteners.openModal);
    }

    for (let i = 0, j = BLR.base.dom['modal-close'].length; i < j; i++) {
        BLR.base.dom['modal-close'][i].addEventListener('click', BLR.eventlisteners.closeModal);
    }

    BLR.base.dom.title.addEventListener('click', BLR.eventlisteners.goHome);

    BLR.eventlisteners.activateUrlFlagSelectors();
    BLR.base.dom.communitiesSelector.addEventListener('click', BLR.eventlisteners.toggleCommunities);
    BLR.base.dom.refreshCacheSelector.addEventListener('click', BLR.eventlisteners.toggleRefreshCache);
    BLR.utils.suggest(BLR.base.dom.q);

    BLR.base.dom.go.addEventListener('click', BLR.eventlisteners.goGetIt);
    BLR.base.dom.form.addEventListener('submit', BLR.eventlisteners.goGetIt);
};

BLR.utils.fetchReceive = function(response) {
    if (!response.ok) {
        throw new Error('HTTP error, status = ' + response.status);
    }

    return response.json();
};

BLR.utils.suggest = function(field) {
    new autoComplete({
        selector: field,
        minChars: 3,
        source: function(term, response) {
            try { fetch.abort() } catch(e) {}
            fetch(`${BLR.base.zenodeo}/v2/families?q=${term}`)
                .then(BLR.utils.fetchReceive)
                .then(response);
        }
    });
};

BLR.utils.makePager = function(data) {
    if (data['num-of-records'] && (data['num-of-records'] >= BLR.base.size)) {
        const p = [];
        const n = [];
        for (let k in data['search-criteria']) {
            if (k === 'page') {
                p.push('page=' + data.prevpage);
                n.push('page=' + data.nextpage);
            }
            else {
                p.push(k + '=' + data['search-criteria'][k]);
                n.push(k + '=' + data['search-criteria'][k]);
            }
        }

        data.prev = '?' + p.join('&');
        data.next = '?' + n.join('&');

        data.pager = true;
    }
    else {
        data.pager = false;
    }
};

BLR.utils.chooseUrlFlags = function (element) {
    if (element.name === 'communities') {

        if (element.value === 'all communities') {

            if (element.checked === true) {
                for (let i = 0, j = BLR.base.dom.communityCheckBoxes.length; i < j; i++) {
                    BLR.base.dom.communityCheckBoxes[i].checked = true;
                }
            }
            else {
                for (let i = 0, j = BLR.base.dom.communityCheckBoxes.length; i < j; i++) {
                    if (BLR.base.dom.communityCheckBoxes[i].value !== 'all communities') {
                        BLR.base.dom.communityCheckBoxes[i].checked = false;
                    }
                }
            }

        }
        else {

            // uncheck 'all communities'
            BLR.base.dom.allCommunities.checked = false;
        }
    }
    else if (element.name === 'resource') {

        const labels = BLR.base.dom.resourceSelector.querySelectorAll('label');
        const inputs = BLR.base.dom.resourceSelector.querySelectorAll('input');

        for (let i = 0; i < labels.length; i++) {
            if (element.value === inputs[i].value) {
                labels[i].classList.add('searchFocus');
                BLR.utils.setPlaceHolder(element.value);
            }
            else {
                labels[i].classList.remove('searchFocus');
            }
        }
    }
    else if (element.name === 'refreshCache') {
        element.value = element.checked;
    }
};

BLR.utils.setPlaceHolder = function(resource) {
    BLR.base.dom.q.placeholder = `search for ${resource}`;
};

/* link load **********************/
BLR.utils.linkLoad = function() {
    let loc = location.pathname.substr(1).split('.')[0];
    if (loc === '/' || loc === '') loc = 'index';

    // load modal page if modal
    if (BLR.base.modals.includes(loc)) {
        BLR.utils.loadModal(loc);
    }

    else if (BLR.base.resources.includes(loc)) {

        // construct Zenodeo URI
        const zenodeoUri = BLR.utils.makeZenodeoUriFromLoc();
        BLR.utils.loadResource(zenodeoUri);
    }
};

BLR.utils.formHasNoValidInput = function() {
    if (BLR.base.dom.q.value === '') {
        return true;
    }

    return false;
};

BLR.utils.makeBrowserUri = function() {
    const browserUriInvalid = ['resource', 'communities', 'go', 'refreshCache'];
    const browserUriParts = [];
    const inputs = BLR.base.dom.form.querySelectorAll('input');

    for (let i = 0, j = inputs.length; i < j; i++) {
        if (!browserUriInvalid.includes(inputs[i].name)) {
            if (inputs[i].type === 'checkbox') {
                if (inputs[i].checked) {
                    browserUriParts.push(inputs[i].name + '=' + inputs[i].value);
                }
            }
            else if (inputs[i].value) {
                browserUriParts.push(inputs[i].name + '=' + inputs[i].value);
            }
        }

        if (inputs[i].name === 'resource' && inputs[i].checked) {
            resource = inputs[i].value;
        }
    }

    return resource + '.html?' + browserUriParts.join('&');
};

BLR.utils.makeZenodeoUriFromInputs = function() {
    const zenodeoUriValid = ['communities', 'q', 'refreshCache', 'page', 'size'];
    const zenodeoUriParts = []; 
    const inputs = BLR.base.dom.form.querySelectorAll('input');

    for (let i = 0, j = inputs.length; i < j; i++) {
        if (zenodeoUriValid.includes(inputs[i].name)) {
            
            if (inputs[i].type === 'checkbox') {
                if (inputs[i].checked) {
                    zenodeoUriParts.push(inputs[i].name + '=' + inputs[i].value);
                }
            }
            else if (inputs[i].value) {
                zenodeoUriParts.push(inputs[i].name + '=' + inputs[i].value);
            }
        }
        
        if (inputs[i].name === 'resource' && inputs[i].checked) {
            BLR.base.resource = inputs[i].value;
        }
    }

    return `${BLR.base.zenodeo}/v2/${BLR.base.resource}?${zenodeoUriParts.join('&')}`;
};

BLR.utils.makeZenodeoUriFromLoc = function() {
    const zenodeoUriValid = ['communities', 'q', 'refreshCache', 'page', 'size', 'treatmentId'];
    const zenodeoUriParts = []; 
    
    let s = location.search;
    if (s.substr(0, 1) === '?') s = s.substr(1);
    const inputs = {};
    s.split('&').forEach(p => { r = p.split('='); inputs[r[0]] = r[1] });
    if (inputs.q) {
        BLR.base.dom.q.value = inputs.q;
    }

    for (let k in inputs) {
        if (zenodeoUriValid.includes(k)) {
            zenodeoUriParts.push(k + '=' + inputs[k]);
        }
    }

    BLR.base.resource = location.pathname.substr(1).split('.')[0];
    return `${BLR.base.zenodeo}/v2/${BLR.base.resource}?${zenodeoUriParts.join('&')}`;
};

BLR.utils.loadModal = function(mode) {
    if (mode === 'index') {

        // set resource and get basic stats to set the placeholder
        BLR.base.resource = BLR.base.defaultResource;
        BLR.utils.setPlaceHolder(BLR.base.resource);
        //const zenodeoUri = BLR.utils.makeZenodeoUriFromLoc();
        BLR.utils.turnOnById('index');
        BLR.base.dom.q.focus();
    }

    // modals other than 'index'
    else {
        BLR.utils.turnOffAll();
        BLR.utils.turnOnById(mode);
    }
};

BLR.utils.loadResource = function(uri) {
    if (BLR.base.resource === 'treatments') {
        BLR.treatments.getTreatments(uri);
    }
    else if (BLR.base.resource === 'images') {
        BLR.images.getImages(uri);
    }
};

// BLR.utils.loadResource = function(resource) {
//     BLR.base.resource = resource;
//     BLR.base.model[BLR.base.resource] = BLR.utils.getResource(uri);

//     if (location.search) {

//         BLR.base.dom[BLR.base.resource].charts.innerHTML = Mustache.render(
//             BLR.base.templates.partials.charts, 
//             BLR.base.model[BLR.base.resource].statistics,
//             {}
//         );

//         BLR.utils.statsChart(BLR.base.resource, BLR.base.model[BLR.base.resource].statistics);
//         const tabs = new Tabby('[data-tabs]');
//     }

//     BLR.utils.turnOnById(loc);
//     BLR.base.dom.q.placeholder = `search ${BLR.base.model[BLR.base.resource].statistics.total} ${BLR.base.resource}`;
//     BLR.base.dom.q.focus();
// };

BLR.utils.formatAuthorsList = function(treatmentAuthors) {

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
//# sourceMappingURL=o3.js.map