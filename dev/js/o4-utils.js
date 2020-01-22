if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

if (!('utils' in O)) O.utils = {};

O.utils.statsChart = function(resource, statistics) {

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

O.utils.niceNumbers = function(n) {
    return n > 9 ? n : ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][n];
};

O.utils.formatSearchCriteria = function(s, n, resource) {
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

O.utils.turnOn = function(element) {
    element.classList.remove('hidden');
    element.classList.add('visible');
};

O.utils.turnOff = function(element) {
    element.classList.remove('visible');
    element.classList.add('hidden');
};

O.utils.turnOnById = function(id) {
    O.utils.turnOn(document.getElementById(id));
};

O.utils.turnOffById = function(id) {
    O.utils.turnOff(document.getElementById(id));
};

O.utils.turnOffAll = function() {

    // turn off all panels including modals and resources
    for (let i = 0, j = O.base.dom.panels.length; i < j; i++) {
        if (O.base.dom.panels[i].classList.contains('visible')) {

            // if the panel is a resource, save it for later use 
            // and then turn it off
            if (O.base.resources.includes(O.base.dom.panels[i].id) || O.base.dom.panels[i].id === 'index') {
                O.base.savedPanel.id = O.base.dom.panels[i].id;
                O.base.savedPanel.search = location.search;
            } 

            O.utils.turnOff(O.base.dom.panels[i]);
        }
    }
};

O.utils.fetchReceive = function(response) {
    if (!response.ok) {
        throw new Error('HTTP error, status = ' + response.status);
    }

    return response.json();
};

O.utils.suggest = function(field) {

    new autoComplete({
        selector: field,
        minChars: 3,
        source: function(term, response) {
            try { fetch.abort() } catch(e) {}
            fetch(`${O.base.zenodeo}/v2/families?q=${term}`)
                .then(O.utils.fetchReceive)
                .then(response);
        }
    });

};

O.utils.makePager = function(data) {
    log.info(`num of records: ${data['num-of-records']}`);

    if (data['num-of-records'] && (data['num-of-records'] >= O.default.search.inputs.size.value)) {
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

O.utils.chooseUrlFlags = function (element) {
    
   if (element.name === 'resource') {

        const labels = O.base.dom.resourceSelector.querySelectorAll('label');
        const inputs = O.base.dom.resourceSelector.querySelectorAll('input');

        for (let i = 0; i < labels.length; i++) {
            if (element.value === inputs[i].value) {
                labels[i].classList.add('searchFocus');
                O.utils.setPlaceHolder(element.value);
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

O.utils.parseUrl = function() {

    log.info('parsing url ' + location.href);
    //this.url = new URL(location);

    target = function() {
        return location.pathname.split('.')[0].replace(/^(\/dev)?\//, '') || 'index';
    };
    
    query = function() {
        const s = new URLSearchParams(location.search);
        const valid = ['communities', 'page', 'size', 'q', 'doi', 'author', 'text'];
        const params = [];
        for (const [key, value] of s) {
            if (valid.includes(key)) {
                params.push(`${key}=${value}`);
            }
        }
        return params.join('&');
    };

    hash = function() {
        const hash = new URLSearchParams(location.hash.replace(/^#/, ''));

        // default values to be returned
        const h = { 
            layout: O.default.imagesLayout, 
            search: O.default.search.type 
        };

        for (let k in h) {
            if (hash.has(k)) {
                h[k] = hash.get(k)
            }
        }

        return h;
    }

    O.base.resource = target();
    log.info(`- O.base.resource: ${O.base.resource}`);

    const h = hash();
    O.base.searchType = h.search;
    O.base.gridType = h.layout;

    log.info(`- O.base.searchType: ${O.base.searchType}`);
    log.info(`- O.base.gridType: ${O.base.gridType}`);

    
    O.base.zenodeoUri = `${O.base.zenodeo}/v2/${O.base.resource}?${query()}`;
    log.info(`- O.base.zenodeoUri: ${O.base.zenodeoUri}`);
};

O.utils.setPlaceHolder = function(resource) {
    O.base.dom.q.placeholder = `search for ${resource}`;
};

// O.utils.parseUrl2 = function() {

//     log.info('parsing url');
//     // first, get the pathname minus the extension
//     //***************************************************** */
//     O.base.resource = location.pathname.substr(1).split('.')[0];

//     // remove leaving 'dev' if any
//     O.base.resource = O.base.resource.replace('dev/', '');
//     O.base.resource = O.base.resource.replace('dev', '');
//     if (O.base.resource === '' || O.base.resource === '/') O.base.resource = 'index';
//     log.info(`- O.base.resource: ${O.base.resource}`);

//     // now determine the searchtype and gridtype
//     //***************************************************** */
//     O.base.searchType = O.search.defaultSearchType;
//     O.base.gridType = O.images.defaultGridType;
    
//     const hash = location.hash.substr(1);

//     if (hash) {

//         hash.split('&').forEach(pair => {

//             const [k, v] = pair.split('=');

//             if (k === 'searchtype') {
//                 O.base.searchType = v;
//             }
//             else if (k === 'gridtype') {
//                 O.base.gridType = v;
//             }

//         });

//     }

//     log.info(`- O.base.searchType: ${O.base.searchType}`);
//     log.info(`- O.base.gridType: ${O.base.gridType}`);

//     // finally, determine the query parameters
//     //***************************************************** */
//     let url = '';
//     if (location.search.substr(0, 1) === '?') {
//         url = location.search.substr(1);
//     }

//     const zenodeoParts = [];

//     if (url) {
//         url.split('&').forEach(pair => {

//             const [k, v] = pair.split('=');
    
//             // is it is valid key? that is, is it a key that should be 
//             // present in the browser url?
//             if (O.utils.isZenodeoKey(k)) {
//                 zenodeoParts.push(`${k}=${v}`);
//             }
    
//         });
    
//         O.base.zenodeoUri = `${O.base.zenodeo}/v2/${O.base.resource}?${zenodeoParts.join('&')}`;

//     }

//     log.info(`- O.base.zenodeoUri: ${O.base.zenodeoUri}`);
    

// };

O.utils.loadpage = function() {

    // determine if a modal is being loaded or a resource. Modals are
    //      index
    //      closed
    //      about
    //      privacy
    //      ip
    //      contact


    // // first, get the pathname minus the extension
    // let target = location.pathname.substr(1).split('.')[0];

    // // remove leaving 'dev' if any
    // target = target.replace('dev/', '');
    // target = target.replace('dev', '');
    // if (target === '' || target === '/') target = 'index';

    O.utils.parseUrl();

    // load modal page if modal
    if (O.base.modals.includes(O.base.resource)) {
        O.utils.loadModal();
    }

    else if (O.base.resources.includes(O.base.resource)) {
        O.utils.loadResource();
    }
};

O.utils.formHasNoValidInput = function() {
    if (O.base.dom.q.value === '') {
        return true;
    }

    return false;
};

O.utils.loadModal = function() {
    log.info(`loading modal ${O.base.resource}`);

    if (O.base.resource === 'index') {

        // detect and display correct search type
        O.search.setSearchType('empty');
        O.utils.turnOnById('index');

    }

    // modals other than 'index'
    else {
        O.utils.turnOffAll();
        O.utils.turnOnById(O.base.resource);
    }
};

O.utils.loadResource = function() {
    //O.base.resource = target;
    log.info(`loading resource ${O.base.resource}`);
        
    // construct Zenodeo URI
    //const zenodeoUri = O.utils.browser2zenodeo();
    log.info(`zenodeoUri: ${O.base.zenodeoUri}`);
    
    // detect and display correct search type
    O.search.setSearchType('filled');

    if (O.base.resource === 'treatments') {
        O.treatments.getTreatments(O.base.zenodeoUri);
    }
    else if (O.base.resource === 'images') {
        O.images.getImages(O.base.zenodeoUri);
    }
};

O.utils.formatAuthorsList = function(treatmentAuthors) {

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

O.utils.toggleSearchType = function() {
    log.info(`displaying ${O.base.searchType} search`);

    
    if (O.base.searchType === 'fancy') {

        //O.search.initializeFancySearch();
        
        O.base.dom.simpleSearchContainer.classList.remove('visible');
        O.base.dom.simpleSearchContainer.classList.add('hidden');

        O.base.dom.fancySearchContainer.classList.remove('hidden');
        O.base.dom.fancySearchContainer.classList.add('visible');

        if (O.base.dom.fsInput) O.base.dom.fsInput.focus();
    }
    else if (O.base.searchType === 'simple') {
        O.base.dom.simpleSearchContainer.classList.remove('hidden');
        O.base.dom.simpleSearchContainer.classList.add('visible');

        O.base.dom.fancySearchContainer.classList.remove('visible');
        O.base.dom.fancySearchContainer.classList.add('hidden');

        if (O.base.dom.q) O.base.dom.q.focus();
    }

};

O.utils.toggleGridType = function() {
    log.info(`displaying ${O.base.searchType}`);
    O.images.changeDensity();
    O.images.activateGridSwitcher();
};

O.utils.loc2qryObj = function() {
    const loc = location.search.substr(1);

    if (loc) {
        const qryObj = {};

        loc.split('&').forEach(p => {
            const [k, v] = p.split('=');
            qryObj[k] = v;
        });

        return qryObj;
    }
    else {
        return null;
    }
};



O.utils.addEvents = function() {

    // all the modals
    //  index
    //  closed
    //  about
    //  privacy
    //  ip
    //  contact
    log.info('adding open modal events');
    for (let i = 0, j = O.base.dom['modal-open'].length; i < j; i++) {
        O.base.dom['modal-open'][i].addEventListener('click', O.eventlisteners.openModal);
    }

    log.info('adding close modal events');
    for (let i = 0, j = O.base.dom['modal-close'].length; i < j; i++) {
        O.base.dom['modal-close'][i].addEventListener('click', O.eventlisteners.closeModal);
    }

    // the title "Ocellus" at the top of the page
    log.info('adding event to title');
    O.base.dom.title.addEventListener('click', O.eventlisteners.goHome);
    
};


// from browser URI to zenodeo URI
// ===================================

// these are the only keys that are allowed in the querystring
// the 'many' keys can be more than one, for example 
//      "?communities=biosyslit&communities=belgiumherbarium"
//
// the 'once' keys can only occur once
//
// keys marked 'reqd: yes' have to be in the querysring
//
// keys marked 'type: query' actually query the database
// keys marked 'type: support' may be required by don't 
// query the database. They filter or contain the results.
// In other words, at least one of the 'type: query' keys
// have to be present in the querystring

O.utils.validKeys = [
    {
        name: 'author',
        reqd: 'no',
        occr: 'once',
        type: 'query',
        zeno: 'yes'
    },
    {
        name: 'communities',
        reqd: 'yes',
        occr: 'many',
        type: 'support',
        zeno: 'yes'
    },
    {
        name: 'doi',
        reqd: 'no',
        occr: 'once',
        type: 'query',
        zeno: 'yes'
    },
    {
        name: 'keywords',
        reqd: 'yes',
        occr: 'many',
        type: 'query',
        zeno: 'yes'
    },
    {
        name: 'page',
        reqd: 'yes',
        occr: 'once',
        type: 'support',
        zeno: 'yes'
    },
    {
        name: 'q',
        reqd: 'no',
        occr: 'once',
        type: 'query',
        zeno: 'yes'
    },
    {
        name: 'refreshCache',
        reqd: 'no',
        occr: 'once',
        type: 'support',
        zeno: 'no'
    },
    {
        name: 'size',
        reqd: 'yes',
        occr: 'once',
        type: 'support',
        zeno: 'yes'
    },
    {
        name: 'title',
        reqd: 'no',
        occr: 'once',
        type: 'query',
        zeno: 'yes'
    },
    {
        name: 'treatmentId',
        reqd: 'no',
        occr: 'once',
        type: 'query',
        zeno: 'yes'
    }
];

O.utils.isZenodeoKey = function(key) {
    for (let i = 0, j = O.utils.validKeys.length; i < j; i++) {
        if (O.utils.validKeys[i].name === key) {
            if (O.utils.validKeys[i].zeno === 'yes') {
                return true;
            }
        }
    }

    return false;
};

O.utils.isBrowserKey = function(key) {
    for (let i = 0, j = O.utils.validKeys.length; i < j; i++) {
        if (O.utils.validKeys[i].name === key) {
            return true;
        }
    }

    return false;
};

O.utils.browser2zenodeo = function() {
    
    // remove leading '?'
    // let url;
    // if (location.search.substr(0, 1) === '?') url = location.search.substr(1);

    // const zenodeoParts = [];

    // url.split('&').forEach(pair => {

    //     const [k, v] = pair.split('=');

    //     // is it is valid key? that is, is it a key that should be 
    //     // present in the browser url?
    //     if (O.utils.isZenodeoKey(k)) {
    //         zenodeoParts.push(`${k}=${v}`);
    //     }

    // });

    return `${O.base.zenodeo}/v2/${O.base.resource}?${zenodeoParts.join('&')}`;
};

O.utils.form2uris = function() {

    const browserInvalid = ['resource', 'go', 'refreshCache'];

    const browserParts = [];
    const zenodeoParts = [];

    let resource;

    const inputs = O.base.dom.form.querySelectorAll('input');

    for (let i = 0, j = inputs.length; i < j; i++) {

        const part = `${inputs[i].name}=${inputs[i].value}`;

        // logic for browser uri
        if (!browserInvalid.includes(inputs[i].name)) {

            if (inputs[i].type === 'checkbox') {
                if (inputs[i].checked) {
                    browserParts.push(part);
                }
            }
            else if (inputs[i].value) {
                browserParts.push(part);
            }

        }

        if (inputs[i].name === 'resource' && inputs[i].checked) {
            resource = inputs[i].value;
        }
        
        // logic for zenodeo uri
        if (inputs[i].type === 'checkbox') {
            if (inputs[i].checked) {
                if (O.utils.isZenodeoKey(inputs[i].name)) {
                    zenodeoParts.push(part);
                }
            }
        }
        else if (inputs[i].value) {
            if (O.utils.isZenodeoKey(inputs[i].name)) {
                zenodeoParts.push(part);
            }
        }

    }

    const browserUri = resource + '.html?' + browserParts.join('&');
    //const zenodeoUri = `${O.base.zenodeo}/v2/${O.base.resource}?${zenodeoParts.join('&')}`;

    log.info(`browserUri: ${browserUri}`);
    //log.info(`zenodeoUri: ${zenodeoUri}`);

    //return [browserUri, zenodeoUri];
    return browserUri;
};

