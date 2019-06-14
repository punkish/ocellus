const zenodoRecord = 'https://zenodo.org/record/';
const header = document.querySelector('header');
const form = document.querySelector('form[name=simpleSearch]');
const formButton = document.querySelector('button[name=simpleSearch]');
const q = document.querySelector('input[name=q]');
const urlFlagSelectors = document.querySelectorAll('.urlFlag');
const communitiesSelector = document.querySelector('.drop-down');
const communityCheckBoxes = document.querySelectorAll('input[name=communities]');
const allCommunities = document.querySelector('input[value="all communities"]');
const refreshCacheSelector = document.querySelector('input[name=refreshCache]');
const about = document.querySelector('#about');
const aboutOpen = document.querySelector('#about-link');
const aboutClose = document.querySelector('#about-close');
const footer = document.querySelector('footer');
const wrapper = document.querySelector('#wrapper');
const resourceSelector = document.querySelector('#resourceSelector');
const figcaptionHeight = '30px';
let figcaptions = [];
let figcaptionLength;

// default number of records to fetch
let size = 30;

// templates
const tmplPager = document.querySelector('#templatePager').innerHTML;
Mustache.parse(tmplPager);

const tmplMasonry = document.querySelector('#templateMasonry').innerHTML;
Mustache.parse(tmplMasonry);

const tmplCarousel = document.querySelector('#templateCarousel').innerHTML;
Mustache.parse(tmplCarousel);

const tmplTreatmentsFTS = document.querySelector('#templateTreatmentsFTS').innerHTML;
Mustache.parse(tmplTreatmentsFTS);

const tmplTreatment = document.querySelector('#templateTreatment').innerHTML;
Mustache.parse(tmplTreatment);

// map params
const map = {
    url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicHVua2lzaCIsImEiOiJjajhvOXY0dW8wMTA3MndvMzBlamlhaGZyIn0.3Ye8NRiiGyjJ1fud7VbtOA'
}

const goGetIt = function(event) {

    if (!location.search && q.value === '') {

        // neither is there an event, that is, nothing has
        // been clicked, nor there are any search params, 
        // that is, we are not trying to load a preformed 
        // URL sent by someone. This means something is not 
        // right. In this case, default to a blank form
        setVisualElements('blank');
        q.placeholder = "c'mon, enter something";
        return false;
    }
    else {
        
        let qp;
        if (event) {

            event.preventDefault();
            event.stopPropagation();

            // construct URL based on form fields
            qp = urlConstruct(form);
        }
        else if (location.search) {
    
            // deconstruct URL based on location.search
            qp = urlDeconstruct(location.search);
        }

        // throbber.classList.toggle('show');
        setVisualElements('queryStart');
        fetchResource[qp.resource](qp);
    }
};

const isXml = function(s) {
    if (s.length === 32) {
        return true;
    }

    return false;
};

const urlDeconstruct = function(s) {
    

    // removing any leading '?'
    if (s.substr(0, 1) === '?') {
        s = s.substr(1);
    }

    const qp = {};
    s.split('&').forEach(p => { r = p.split('='); qp[r[0]] = r[1] });
    return qp;
};

const urlConstruct = function(form) {

    let queryParams = {};

    const q = form.querySelector('input[name=q]').value;

    if (isXml(q)) {
        queryParams.treatmentId = q;
        queryParams.resource = 'treatment';
        const rc = urlFlagSelectors.querySelector('input[name=refreshCache');
        if (rc.checked) {
            queryParams.refreshCache = true;
        }
    }
    else {
        queryParams.q = q;
        for (let i = 0, j = urlFlagSelectors.length; i < j; i++) {

            const element = urlFlagSelectors[i];
            
            if (element.checked) {
                queryParams[element.name] = element.value;
            }
    
        }
    
        if (queryParams.resource === 'images') {
            queryParams.page = form.querySelector('input[name=page]').value;
            queryParams.access_right = 'open';
            queryParams.type = 'image';
        }
        else if (queryParams.resource === 'treatments') {
            delete queryParams.communities;
            queryParams.id = form.querySelector('input[name=id]').value;
        }

        // number of records to fetch
        queryParams.size = size;
        
    }

    return queryParams;
};

const goHome = function() {
    location.search = '/'
};

const makeLayout = function(imagesOfRecords) {
        
    let imgCount = 0;
    let figures = [];

    for (let record in imagesOfRecords) {
        
        const images = imagesOfRecords[record].images;
        const j = images.length;
        imgCount = imgCount + j;
        const recId = record.split('/').pop();

        let imgBlur; // 10 pixels wide
        let imgA_; // 50 pixels 
        let imgA; // 250 pixels 
        let imgB; // 400
        let imgC; // 960
        let imgD; // 1200

        if (imagesOfRecords[record].thumb250 === 'na') {
            imgBlur = imgA_ = imgA = imgB = imgC = imgD = 'img/kein-preview.png';
        }
        else {
            imgA = imagesOfRecords[record].thumb250;
            imgBlur = imgA.replace('250', '10');
            imgA_ = imgA.replace('250', '50');
            imgB = imgA.replace('250,', '400,');
            imgC = imgA.replace('250,', '960,');
            imgD = imgA.replace('250,', '1200,');
        }

        const figure = {
            title: imagesOfRecords[record].title,
            creators: imagesOfRecords[record].creators,
            recId: recId,
            zenodoRecord: zenodoRecord + recId,
            imageSrc: images[0],
            imgBlur: imgBlur,
            imgA: imgA,
            imgA_: imgA_,
            imgB: imgB,
            imgC: imgC,
            imgD: imgD
        };
        
        figures.push(figure)
    }

    return [figures, imgCount];
};

const niceNumbers = function(num) {

    const nums = {
        '0': 'Zero',
        '1': 'One',
        '2': 'Two',
        '3': 'Three',
        '4': 'Four',
        '5': 'Five',
        '6': 'Six',
        '7': 'Seven',
        '8': 'Eight',
        '9': 'Nine'
    };

    return nums[num] || num;
};

// https://andylangton.co.uk/blog/development/get-viewportwindow-size-width-and-height-javascript
const getHeightofVisibleViewport = function() {

    let viewportwidth;
    let viewportheight;
     
    // the more standards compliant browsers 
    // (mozilla/netscape/opera/IE7) use window.innerWidth 
    // and window.innerHeight
    if (typeof window.innerWidth !== 'undefined') {
         viewportwidth = window.innerWidth,
         viewportheight = window.innerHeight
    }
     
    // IE6 in standards compliant mode (i.e. with a 
    // valid doctype as the first line in the document)
    else if (typeof document.documentElement !== 'undefined'
        && typeof document.documentElement.clientWidth !==
        'undefined' && document.documentElement.clientWidth !== 0) {
          viewportwidth = document.documentElement.clientWidth,
          viewportheight = document.documentElement.clientHeight
    }
     
    // older versions of IE
    else {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
        viewportheight = document.getElementsByTagName('body')[0].clientHeight
    }

    return (viewportwidth - header.clientHeight);
};

const savedState = {};
const setVisualElements = function(state) {

    // blank state (initial state)
    if (state === 'blank') {
        throbber.classList.remove('show');
        wrapper.classList.remove('show');
        about.classList.remove('show');
        footer.classList.remove('relative');
    }
    
    // about state
    else if (state === 'about') {

        if (about.classList.contains('show')) {
            about.classList.remove('show');

            if (savedState.wrapper === 'show') {
                wrapper.classList.add('show');
            }
            else {
                wrapper.classList.remove('show');
            }

            if (savedState.footer === 'relative') {
                footer.classList.add('relative');
            }
            else {
                footer.classList.remove('relative');
            }
        }
        else {

            throbber.classList.remove('show');

            if (wrapper.classList.contains('show')) {
                savedState.wrapper = 'show';
                wrapper.classList.remove('show');
            }
            
            about.classList.add('show');

            const visibleViewportHeight = getHeightofVisibleViewport();
            if (about.clientHeight < visibleViewportHeight) {

                if (footer.classList.contains('relative')) {
                    savedState.footer = 'relative';
                    footer.classList.remove('relative');
                }
                
            }
            else {

                if (!footer.classList.contains('relative')) {
                    savedState.footer = '';
                    footer.classList.add('relative');
                }
                
            }
        }
    }

    // query start
    else if (state === 'queryStart') {
        throbber.classList.add('show');
        about.classList.remove('show');
    }
    
    // query end no result
    else if (state === 'queryEndNoResult') {
        throbber.classList.remove('show');
        wrapper.classList.remove('show');
        about.classList.remove('show');
        footer.classList.remove('relative');
        refreshCacheSelector.checked = false;
    }
    
    // query end with result
    else if (state === 'queryEndWithResult') {
        throbber.classList.remove('show');
        wrapper.classList.add('show');
        about.classList.remove('show');
        footer.classList.add('relative');

        // const visibleViewportHeight = getHeightofVisibleViewport();
        // if (wrapper.clientHeight < visibleViewportHeight) {
        //     footer.classList.remove('relative');
        // }
        // else {
        //     footer.classList.add('relative');
        // }

        refreshCacheSelector.checked = false;
    }

    // carousel on
    else if (state === 'turnCarouselOn') {
        wrapper.classList.remove('show');
        carouselContainer.classList.add('show');
    }

    // carousel off
    else if (state === 'turnCarouselOff') {
        wrapper.classList.add('show');
        carouselContainer.classList.remove('show');
    }
    
};

const makeUris = function(qp) {
    let hrefArray1 = [];
    let hrefArray2 = [];

    for (let p in qp) {

        // We don't want to send 'resource' to Zenodeo
        // because 'resource' is already in the uri
        if (p !== 'resource') {
            hrefArray1.push(p + '=' + qp[p]);
        }

        // We don't want 'refreshCache' in the browser
        // address bar
        if (p !== 'refreshCache') {
            hrefArray2.push(p + '=' + qp[p]);
        }
    }

    const uri = `${zenodeo}/v2/${qp.resource}?${hrefArray1.join('&')}`;
    const search = hrefArray2.join('&');
    history.pushState('', '', `?${hrefArray2.join('&')}`);
    

    return {
        search: search,
        uri: uri
    }

};

const makeMap = function(mcs) {

    document.querySelector('#map').classList.toggle('show');

    // initialize the map and add the layers to it
    const mcmap = L.map('map', {
        center: [0, 0],
        zoom: 8,
        scrollWheelZoom: false
    });

    L.tileLayer(map.url, {
        attribution: map.attribution,
        maxZoom: 18,
        id: map.id,
        accessToken: map.accessToken
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
    
};


const makePager = function(data, search, page) {

    if (data.recordsFound && (data.recordsFound >= size)) {
        if (page) {

            // making pager for images
            let prev = 'page=';
            let next = 'page=';
            
            prev += (page === 1) ? 1 : page - 1;
            next += parseInt(page) + 1;

            data.prev = '?' + search.replace(/page=\d+/, prev);
            data.next = '?' + search.replace(/page=\d+/, next);
            
        }
        else {

            // making pager for treatments
            let prev = 'id=' + data.previd;
            let next = 'id=' + data.nextid;

            data.prev = '?' + search.replace(/id=\d+/, prev);
            data.next = '?' + search.replace(/id=\d+/, next);
        }
    }

    data.pager = true;
    return data;
};

// const makeTreatmentsPager = function(data, search) {

//     if (data.recordsFound && (data.recordsFound >= size)) {
//         data.prev = `?${search}&id=${data.previd}`;
//         data.next = `?${search}&id=${data.nextid}`;
//         data.pager = true;
//     }

//     return data;
// };

const submitReporter = function(event) {

    const send = event.target;
    const form = send.parentElement;
    const widget = form.parentElement;
    const report = widget.querySelector('.report');
    const reporter = form.querySelector('.imageReport');
    const recId = form.querySelector('input[name="recId"]').value;
    const status = widget.querySelector('.status');

    // Send a POST request to /repos/:owner/:repo/issues with JSON
    const github = 'https://api.github.com/repos/plazi/Biodiversity-Literature-Repository/issues';

    const payload = JSON.stringify({
        "title": `problem with record id: ${recId}`,
        "body": reporter.innerText,
        "assignee": "myrmoteras",
        "milestone": 1,
        "labels": [
            "images"
        ]
    });

    const method = 'POST';
    const url = github;
    const callback = function() {

            // show widget
            form.style.visibility = 'hidden';
            status.innerHTML = 'Thank you for submitting the report!';
            status.style.visibility = 'visible';
            status.style.display = 'block';

            setInterval(function() {
                status.style.visibility = 'hidden';
                status.style.display = 'none';
                report.style.visibility = 'visible';
            }, 3000);
    };
    const headers = [
        {k: "Content-type", v: "application/json"},
        {k: "Authorization", v: "Basic " + btoa("blruser:xucqE5-tezmab-ruqgyr")}
    ]

    x(method, url, callback, headers, payload);

    event.preventDefault();
    event.stopPropagation();
};

const toggleReporter = function(event) {

    const r = event.target;
    const f = r.parentElement.querySelector('form');

    // show widget
    f.style.visibility = 'visible';

    // hide report button
    r.style.visibility = 'hidden';

    event.preventDefault();
    event.stopPropagation();
};

const cancelReporter = function(event) {

    const c = event.target;
    const f = c.parentElement;
    const r = f.parentElement.querySelector('.report');

    // show widget
    f.style.visibility = 'hidden';

    // hide report button
    r.style.visibility = 'visible';

    event.preventDefault();
    event.stopPropagation();
};

const fetchResource = {

    treatments: function(qp) {

        const {search, uri} = makeUris(qp);

        let callback;

        // single treatment
        if (qp.treatmentId) {
            callback = function(xh) {

                //let data = xh.value;

                let data = xh.value;
    
                if (qp.format === 'xml') {
                    return data;
                }
                else {
                    
                    [data.figures, data.imgCount] = makeLayout(data.images.images);
                    data.imgCount = niceNumbers(data.imgCount);
    
                    wrapper.innerHTML = Mustache.render(tmplTreatment, data);
                    setVisualElements('queryEndWithResult');
    
                    if (data.imgCount !== 'Zero') {
                        const figs = document.querySelectorAll('figcaption > a');
                        // const reporters = document.querySelectorAll('.report');
                        // const submitters = document.querySelectorAll('.submit');
                        // const cancellers = document.querySelectorAll('.cancel');
                        
                        for (let i = 0, j = figs.length; i < j; i++) {
                            figs[i].addEventListener('click', toggleFigcaption);
                            // reporters[i].addEventListener('click', toggleReporter);
                            // submitters[i].addEventListener('click', submitReporter);
                            // cancellers[i].addEventListener('click', cancelReporter);
                        }
                    }
    
                    if (data.materialsCitations) {
                        makeMap(data.materialsCitations);
                    }
                    
                }
    
            };
        }

        // many treatents
        else {
            callback = function(xh) {

                let data = {
                    recordsFound: 0,
                    treatments: [],
                    prev: '',
                    next: '',
                    previd: 0,
                    nextid: 0,
                    pager: false
                };

                data.treatments = xh.value.treatments;
                data.previd = xh.value.previd;
                data.nextid = xh.value.nextid;
                data.recordsFound = niceNumbers(data.treatments.length);

                data = makePager(data, search);
                //data.found = niceNumbers(xh.value.length);
                
                wrapper.innerHTML = Mustache.render(tmplTreatmentsFTS, data, {templatePager: tmplPager});
                setVisualElements('queryEndWithResult');

                // add clickEvent to links to get more details of a treatment
                const treatmentLinks = document.querySelectorAll('.treatmentLink');
                for (let i = 0, j = treatmentLinks.length; i < j; i++) {
                    const t = treatmentLinks[i];
                    const qp = urlDeconstruct(t.search);

                    t.addEventListener('click', function(event) {
                        event.stopPropagation();
                        event.preventDefault();
                        
                        setVisualElements('queryStart');
                        fetchResource['treatments'](qp);
                    });
                }

            };
        }

        x(uri, callback);
        
        return false;
    },
    
    images: function(qp) {

        const {search, uri} = makeUris(qp);

        const callback = function(xh) {

            let data = {
                recordsFound: 0,
                imagesFound: 0,
                figures: [],
                prev: '',
                next: '',
                pager: false
            };

            const {total, imagesOfRecords} = xh.value;

            data.recordsFound = total;
            [data.figures, data.imagesFound] = makeLayout(imagesOfRecords);
            
            data = makePager(data, search, qp.page);
            data.recordsFound = niceNumbers(data.recordsFound);

            wrapper.innerHTML = Mustache.render(tmplMasonry, data, {templatePager: tmplPager});
            setVisualElements('queryEndWithResult');     

            const figs = document.querySelectorAll('figcaption > a');
            for (let i = 0, j = figs.length; i < j; i++) {
                figs[i].addEventListener('click', toggleFigcaption);
            }

            const carousel = document.querySelectorAll('.carousel');
            for (let i = 0, j = carousel.length; i < j; i++) {
                carousel[i].addEventListener('click', function(event) {
                    turnCarouselOn(data, data.figures[i].recId);
                });
            }
            
        };

        x(uri, callback);
        
        return false;
    }

};

const toggleAbout = function(event) {
    setVisualElements('about');
};

const chooseUrlFlags = function (element) {

    if (element.name === 'communities') {

        if (element.value === 'all communities') {

            if (element.checked === true) {
                for (let i = 0, j = communityCheckBoxes.length; i < j; i++) {
                    communityCheckBoxes[i].checked = true;
                }
            }
            else {
                for (let i = 0, j = communityCheckBoxes.length; i < j; i++) {
                    if (communityCheckBoxes[i].value !== 'all communities') {
                        communityCheckBoxes[i].checked = false;
                    }
                }
            }

        }
        else {

            // uncheck 'all communities'
            allCommunities.checked = false;
        }
    }
    else if (element.name === 'resource') {

        const rtLabels = resourceSelector.querySelectorAll('label');
        const rtInputs = resourceSelector.querySelectorAll('input');

        for (let i = 0; i < rtLabels.length; i++) {
            if (element.value === rtInputs[i].value) {
                rtLabels[i].classList.add('searchFocus');
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

const toggleCommunities = function(event) {
    communitiesSelector.classList.toggle('open');
};

const defaultHeaders = [
    {k: "Content-Type", v: "application/json;charset=UTF-8"}
];

const x = function(url, callback, headers = defaultHeaders, payload = '') {

    const method = 'GET';
    const xh = new XMLHttpRequest();

    xh.onload = function(e) {
        if (xh.readyState === 4) {
            if (xh.status === 200) {
                const res = JSON.parse(xh.responseText);
                callback(res);
            }
        }
    };

    xh.onerror = function(e) {
        console.error(xh.statusText);
    };

    xh.open(method, url, true);

    if (headers.length) {
        
        for (let i = 0, j = headers.length; i < j; i++) {
            xh.setRequestHeader(headers[i].k, headers[i].v);
        }
    }

    xh.send(payload);
};

const suggest = function(field) {

    new autoComplete({
        selector: field,
        minChars: 3,
        source: function(term, response) {
            try { x.abort() } catch(e) {}
            x(`${zenodeo}/v2/families?q=${term}`, response)
        }
    });
    
};

const toggleFigcaption = function(event) {

    // find and store all the figcaptions on the page in 
    // an array. This is done only once since figcaptions 
    // is a global var
    if (figcaptions.length == 0) {
        figcaptions = document.querySelectorAll('figcaption');
        figcaptionLength = figcaptions.length;
    }

    let fc = this.parentElement.style.maxHeight;
    
    if (fc === figcaptionHeight || fc === '') {
        let i = 0;
        for (; i < figcaptionLength; i++) {
            figcaptions[i].style.maxHeight = figcaptionHeight;
        }

        this.parentElement.style.maxHeight =  '100%';
        this.parentElement.style.overflow = 'auto';
    }
    else {
        this.parentElement.style.maxHeight =  figcaptionHeight;
        this.parentElement.style.overflow = 'hidden';
    }
    
};

const activateUrlFlagSelectors = function() {
    for (let i = 0, j = urlFlagSelectors.length; i < j; i++) {

        const element = urlFlagSelectors[i];
        element.addEventListener('click', function(event) {
    
            chooseUrlFlags(element);
            
                if (element.name === 'communities') {
                    communitiesSelector.classList.remove('open');
                }
    
        })
    }
};

const turnCarouselOn = function(data, recId) {

    carousel.innerHTML = Mustache.render(tmplCarousel, data);
    setVisualElements('turnCarouselOn');

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

const turnCarouselOff = function(event) {
    setVisualElements('turnCarouselOff');
};

aboutOpen.addEventListener('click', toggleAbout);
aboutClose.addEventListener('click', toggleAbout);
communitiesSelector.addEventListener('click', toggleCommunities);
form.addEventListener('submit', goGetIt);
formButton.addEventListener('click', goGetIt);
suggest(q);
activateUrlFlagSelectors();

if (location.search) {
    goGetIt();
}