const withAjax = false;
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
const refreshCacheWarning = document.querySelector('#refreshCacheWarning');
const article = document.querySelector('article');
const resourceSelector = document.querySelector('#resourceSelector');
const figcaptionHeight = '30px';
let figcaptions = []; 
const treatmentInfo = document.querySelector('#treatmentInfo');

// various divs to be populated later
const throbber = document.querySelector('#throbber');
const charts = document.querySelector('#charts');
const about = document.querySelector('#about');
const privacy = document.querySelector('#privacy');
const images = document.querySelector('#images');
const carousel = document.querySelector('#carousel');
const treatments = document.querySelector('#treatments');
const treatment = document.querySelector('#treatment');

const divs = {
    pre: {
        throbber: throbber
    },
    modals: {
        charts: charts,
        about: about,
        privacy: privacy
    },
    results: {
        images: images,
        carousel: carousel,
        treatments: treatments,
        treatment: treatment
    }
}

// templates
const tmplImages = document.querySelector('#templateImages').innerHTML;
const tmplCarousel = document.querySelector('#templateCarousel').innerHTML;
const tmplTreatments = document.querySelector('#templateTreatments').innerHTML;
const tmplTreatment = document.querySelector('#templateTreatment').innerHTML;

Mustache.parse(tmplImages);
Mustache.parse(tmplCarousel);
Mustache.parse(tmplTreatments);
Mustache.parse(tmplTreatment);

// default number of records to fetch
let size = 30;
//let chart;
const DATA = {
    charts: {
        statistics: {
            treatments: 0,
            specimens: 0,
            "male specimens": 0,
            "female specimens": 0,
            "treatments with specimens": 0,
            "treatments with male specimens": 0,
            "treatments with female specimens": 0,
            images: 0
        }
    },
    // about: {
    //     visibility: "hide"
    // },
    // privacy: {
    //     visibility: "hide"
    // },
    images: {
        // visibility: "hide",
        recordsFound: 45,
        from: 1,
        to: 30,
        figures: [
            {
                imgBlur: "",
                imgA: "",
                recId: "",
                title: "",
                zenodoRecord: ""
            }
        ],
        pager: {
            prev: 0,
            next: 31
        }
    },
    carousel: {
        visibility: "hide",
        figures: [
            {
                imgBlur: "",
                imgA: "",
                recId: "",
                title: "",
                zenodoRecord: ""
            }
        ]
    },
    treatments: {
        // visibility: "hide",
        recordsFound: 45,
        from: 1,
        to: 30,
        treatments: [
            {
                treatmentTitle: "",
                images: [
                    {
                        thumb50: "",
                        imageTitle: ""
                    }
                ],
                s: "",
                treatmentId: ""
            }
        ],
        pager: {
            prev: 0,
            next: 31
        }
    },
    treatment: {
        // visibility: "hide",
        treatmentTitle: "",
        zenodeo: "",
        treatmentId: "",
        doi: "",
        zenodoDep: "",
        authorsList: "",
        journalYear: "", 
        articleTitle: "",
        journalTitle: "",
        journalVolume: "",
        journalIssue: "",
        pages: "",
        taxonStats: {

        },
        mapState: "",
        figures: [
            {
                imgBlur: "",
                imgA: "",
                recId: "",
                title: "",
                zenodoRecord: ""
            }
        ],
        citations: [
            {
                citation: ""
            }
        ],
        xml: ""
    }
}

// map params
const map = {
    url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicHVua2lzaCIsImEiOiJjajhvOXY0dW8wMTA3MndvMzBlamlhaGZyIn0.3Ye8NRiiGyjJ1fud7VbtOA'
}

function goGetIt(event) {
  
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
}

function isXml(s) {
    if (s.length === 32) {
        return true;
    }

    return false;
}

function urlDeconstruct(s) {
    
    // removing any leading '?'
    if (s.substr(0, 1) === '?') {
        s = s.substr(1);
    }

    const qp = {};
    s.split('&').forEach(p => { r = p.split('='); qp[r[0]] = r[1] });
    if (qp.q) {
        q.value = qp.q;
    }

    return qp;
}

function urlConstruct(form) {

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
}

const goHome = function() {
    location.search = '/'
};

function makeLayout(imagesOfRecords) {
        
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
}

function niceNumbers(num) {
    if (num < 10) {
        return ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine'][num];
    }
    else {
        return num;
    }
}

// https://andylangton.co.uk/blog/development/get-viewportwindow-size-width-and-height-javascript
function getHeightofVisibleViewport() {

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
}

function setVisualElements(state) {

    const hideEverything = function(resetRc = true) {

        // hide everything
        for (let c in divs) {
            let coll = divs[c];
            for (let d in coll) {
                coll[d].classList.remove('show')
            }
        }

        if (resetRc) {
            refreshCacheSelector.checked = false;
        }
    }

    // blank state (initial state)
    if (state === 'blank') {
        hideEverything();

        // show the chart
        charts.classList.add('show');
    }
    
    // open about state
    else if (state === 'about-open') {
        hideEverything(true);

        // show about
        about.classList.add('show');
    }

    // close about state
    else if (state === 'about-close') {
        hideEverything(true);

        // show chart
        charts.classList.add('show');
    }

    // privacy state
    else if (state === 'privacy-open') {
        hideEverything(true);

        // show privacy
        privacy.classList.add('show');
    }

    else if (state === 'privacy-close') {
        hideEverything(true);

        // show chart
        charts.classList.add('show');
    }

    // query start
    else if (state === 'queryStart') {
        hideEverything(true);

        // turn on the throbber
        throbber.classList.add('show');
    }
    
    // query end no result
    else if (state === 'queryEndNoResult') {
        hideEverything();
    }
    
    // query end with result
    else if (state === 'queryEndWithTreatments') {
        hideEverything();

        // show charts and treatments
        charts.classList.add('show');
        treatments.classList.add('show');
    }

    else if (state === 'queryEndWithTreatment') {
        hideEverything();

        // show single treatment
        treatment.classList.add('show');
    }

    else if (state === 'queryEndWithImages') {
        hideEverything();

        // show charts and images
        charts.classList.add('show');
        treatment.classList.add('show');
    }

    // carousel on
    else if (state === 'turnCarouselOn') {
        hideEverything();

        // show carousel
        carousel.classList.add('show');
    }

    // carousel off
    else if (state === 'turnCarouselOff') {
        
        // hide everything
        for (let c in divs) {
            let coll = divs[c];
            for (let d in coll) {
                coll[d].classList.remove('show')
            }
        }

        refreshCacheSelector.checked = false;

        // show charts and images
        charts.classList.add('show');
        treatment.classList.add('show');
    }
    
}

function makeUris(qp, setHistory = true) {

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

    if (setHistory) {
        history.pushState('', '', `?${hrefArray2.join('&')}`);
    }
    
    return {
        search: search,
        uri: uri
    }

}

function makeMap(mcs) {

    

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
            //console.log(mc.latitude, mc.longitude)
            const marker = L.marker([mc.latitude, mc.longitude]).addTo(mcmap);
            marker.bindPopup(mc.typeStatus);
            markers.push(marker)
        }
    })

    const bounds = new L.featureGroup(markers).getBounds();
    mcmap.fitBounds(bounds);
    
}

function makePager(data, search, page) {

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

            if (data.previd !== '') {
                if (search.indexOf('id') > -1) {
                    data.prev = '?' + search.replace(/id=\d+/, prev);
                }
                else {
                    data.prev = `?${search}&${prev}`;
                }
            }
            else {
                data.prev = '';
            }

            if (data.nextid !== '') {
                if (search.indexOf('id') > -1) {
                    data.next = '?' + search.replace(/id=\d+/, next);
                }
                else {
                    data.next = `?${search}&${next}`;
                }
            }
            else {
                data.next = '';
            }
        }
    }

    data.pager = true;
    return data;
}

function submitReporter(event) {

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
}

function toggleReporter(event) {

    const r = event.target;
    const f = r.parentElement.querySelector('form');

    // show widget
    f.style.visibility = 'visible';

    // hide report button
    r.style.visibility = 'hidden';

    event.preventDefault();
    event.stopPropagation();
}

function cancelReporter(event) {

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

    stats: function(qp) {

        const setPlaceHolderMessage = function(resource) {
            q.placeholder = `search ${DATA.charts.statistics[resource]} ${resource}`;
        };

        // if (qp.resource === 'all') {

        //     // get the treatments and their stats
        //     let {search, uri} = makeUris({
        //         resource: 'treatments', 
        //         stats: true
        //     }, false);

        //     x(uri, (xh) => {
        //         for (let k in xh.value) {
        //             DATA.charts.statistics[k] = xh.value[k];
        //         }

        //         setPlaceHolderMessage('treatments');
        //         chart = statsChart();
        //         setVisualElements('blank');
        //     });
        // }

        if (DATA.charts.statistics[qp.resource] === 0) {

            const {search, uri} = makeUris(qp, false);

            x(uri, (xh) => {
                for (let k in xh.value) {
                    DATA.charts.statistics[k] = xh.value[k];
                }
                setPlaceHolderMessage(qp.resource);
                chart = statsChart();
                setVisualElements('blank');
            });
        }

        else {
            setPlaceHolderMessage(qp.resource);
            chart = statsChart();
        }
    },

    treatments: function(qp) {

        console.log('fetching ' + qp.resource)

        const {search, uri} = makeUris(qp);

        let callback;

        // single treatment
        if (qp.treatmentId) {
            //console.log('getting a single treatment ' + qp.treatmentId)
            callback = function(xh) {

                //let data = xh.value;

                DATA.treatment = xh.value;
    
                if (qp.format === 'xml') {
                    return DATA.treatment;
                }

                else {
                    
                    //[DATA.treatment.figures, DATA.treatment.imgCount] = makeLayout(xh.value.images.images);

                    //data.imgCount = niceNumbers(data.imgCount);
                    DATA.treatment.imgCount = niceNumbers(xh.value.imgCount);
                    DATA.treatment.zenodeo = zenodeo;

                    if (DATA.treatment.materialsCitations.length) {
                        DATA.treatment.mapState = 'open';
                    }
                    
                    treatment.innerHTML = Mustache.render(tmplTreatment, DATA.treatment);
                    setVisualElements('queryEndWithTreatment');
                    
    
                    if (xh.value.imgCount !== 'Zero') {
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
    
                    if (DATA.treatment.materialsCitations.length) {
                        //console.log(DATA.treatment.materialsCitations)
                       
                        
                        document.querySelector('#map').classList.add('show');
                        makeMap(DATA.treatment.materialsCitations);
                    }
                    
                }
    
            };
        }
        
        // many treatments
        else {
            //console.log('getting many treatments')
            callback = function(xh) {

                // let data = {
                //     recordsFound: 0,
                //     treatments: [],
                //     prev: '',
                //     next: '',
                //     previd: 0,
                //     nextid: 0,
                //     pager: false
                // };

                DATA.treatments.resource = 'treatments';
                DATA.treatments.whereCondition = xh.value.whereCondition;
                

                DATA.treatments.condition = ''
                DATA.treatments.recordsFound = niceNumbers(xh.value.recordsFound);
                DATA.treatments.from = xh.value.from;
                DATA.treatments.to = xh.value.to;
                DATA.treatments.treatments = xh.value.treatments;

                // data.previd = xh.value.previd;
                // data.nextid = xh.value.nextid;
                
                

                //data = makePager(data, search);
                //data.found = niceNumbers(xh.value.length);
                

                treatments.innerHTML = Mustache.render(tmplTreatments, DATA.treatments);
                setVisualElements('queryEndWithTreatments');

                for (let k in xh.value.statistics) {
                    DATA.charts.statistics[k] = xh.value.statistics[k];
                }

                chart = statsChart();
                // if (chart) {
                //     chart.data.datasets[0].data = Object.values(statistics);
                //     chart.options.scales.yAxes[0].ticks.min = 0;

                //     // https://stackoverflow.com/questions/1669190/find-the-min-max-element-of-an-array-in-javascript/30834687#30834687
                //     chart.options.scales.yAxes[0].ticks.max = Math.max(...Object.values(statistics));
    
                //     chart.update();
                // }
                // else {
                //     chart = statsChart();
                // }
                
                

                // add clickEvent to links to get more details of a treatment
                if (withAjax) {
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

            wrapper.innerHTML = Mustache.render(
                tmplMasonry, 
                data, 
                { templatePager: tmplPager, templateRecordsFound: tmplRecordsFound }
            );
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

const toggleRefreshCache = function(event) {
    refreshCacheWarning.classList.toggle('show');
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
                getStats(rtInputs[i].value);
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

const getStats = function(resource) {
    fetchResource.stats({resource: resource, stats: true});
};

const chartWithChartjs = function() {
    return new Chart(chart, {
        type: 'bar',
        data: {
            labels: Object.keys(DATA.charts.statistics),
            datasets: [{
                label: 'statistics',
                data: Object.values(DATA.charts.statistics),
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
};

const chartwithChartist = function() {
    const chartData = {

        // A labels array that can contain any sort of values
        labels: Object.keys(DATA.charts.statistics),

        // Our series array that contains series objects or in
        // this case series data arrays
        series: [
            Object.values(DATA.charts.statistics)
        ]
    };

    const chartOptions = {
        plugins: [
            Chartist.plugins.ctPointLabels({
                textAnchor: 'middle'
            })
        ],
        seriesBarDistance: 20,
    };
    
    new Chartist.Bar('.ct-chart', chartData, chartOptions);
};


const statsChart = function() {
    return chartWithChartjs();
};

communitiesSelector.addEventListener('click', toggleCommunities);
refreshCacheSelector.addEventListener('click', toggleRefreshCache);

if (withAjax) {
    form.addEventListener('submit', goGetIt);
    formButton.addEventListener('click', goGetIt);
}

suggest(q);
activateUrlFlagSelectors();

let savedNonModal;
const modalOpenFunc = function(event) {
    event.preventDefault();
    event.stopPropagation();

    setVisualElements("about-open");
};

const modalCloseFunc = function(event) {
    event.preventDefault();
    event.stopPropagation();

    setVisualElements("about-close");
};

const modalOpen = document.querySelectorAll('.modal-open');
const modalClose = document.querySelectorAll('.modal-close');

for (let i = 0, j = modalOpen.length; i < j; i++) {
    modalOpen[i].addEventListener('click', modalOpenFunc);
}

for (let i = 0, j = modalClose.length; i < j; i++) {
    modalClose[i].addEventListener('click', modalCloseFunc);
}

if (location.search) {
    goGetIt();
}
else {
    //fetchResource.stats({resource: 'all', stats: true});
    fetchResource.stats({resource: 'treatments', stats: true});
    q.focus();
}

// window.onpopstate = function(event) {
//     // alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
//     goGetIt();
//     //console.log(history)
// };