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

    // remove 'dev/' if any
    loc = loc.replace('dev/', '');

    if (loc === '' || loc === '/') {
        loc = 'index';
    }

    console.log("loc: " + loc)

    // load modal page if modal
    if (BLR.base.modals.includes(loc)) {
        console.log("loading modal");
        BLR.utils.loadModal(loc);
    }

    else if (BLR.base.resources.includes(loc)) {
        
        // construct Zenodeo URI
        const zenodeoUri = BLR.utils.makeZenodeoUri('loc');
        console.log("loading " + zenodeoUri);
        BLR.utils.loadResource(zenodeoUri);
    }
    // else {
    //     console.log("phhhht")
    // }
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

// BLR.utils.makeZenodeoUriFromInputs = function() {
//     const zenodeoUriValid = ['communities', 'q', 'refreshCache', 'page', 'size'];
//     const zenodeoUriParts = []; 
//     const inputs = BLR.base.dom.form.querySelectorAll('input');

//     for (let i = 0, j = inputs.length; i < j; i++) {
//         if (zenodeoUriValid.includes(inputs[i].name)) {
            
//             if (inputs[i].type === 'checkbox') {
//                 if (inputs[i].checked) {
//                     zenodeoUriParts.push(inputs[i].name + '=' + inputs[i].value);
//                 }
//             }
//             else if (inputs[i].value) {
//                 zenodeoUriParts.push(inputs[i].name + '=' + inputs[i].value);
//             }
//         }
        
//         if (inputs[i].name === 'resource' && inputs[i].checked) {
//             BLR.base.resource = inputs[i].value;
//         }
//     }

//     return `${BLR.base.zenodeo}/v2/${BLR.base.resource}?${zenodeoUriParts.join('&')}`;
// };

// BLR.utils.makeZenodeoUriFromLoc = function() {
//     const zenodeoUriValid = ['communities', 'q', 'refreshCache', 'page', 'size', 'treatmentId'];
//     const zenodeoUriParts = []; 
    
//     let s = location.search;
//     if (s.substr(0, 1) === '?') s = s.substr(1);
//     const inputs = {};
//     s.split('&').forEach(p => { r = p.split('='); inputs[r[0]] = r[1] });
//     if (inputs.q) {
//         BLR.base.dom.q.value = inputs.q;
//     }

//     for (let k in inputs) {
//         if (zenodeoUriValid.includes(k)) {
//             zenodeoUriParts.push(k + '=' + inputs[k]);
//         }
//     }

//     BLR.base.resource = location.pathname.substr(1).split('.')[0];
//     return `${BLR.base.zenodeo}/v2/${BLR.base.resource}?${zenodeoUriParts.join('&')}`;
// };

BLR.utils.makeZenodeoUri = function(from) {
    const zenodeoUriValid = ['communities', 'q', 'refreshCache', 'page', 'size', 'treatmentId'];
    const zenodeoUriParts = [];

    if (from === 'inputs') {
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
    }
    else if (from === 'loc') {
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
    }
    
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
    console.log("resource: " + BLR.base.resource);
    
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