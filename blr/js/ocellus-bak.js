'use strict';

const Ocellus = (function() {
    
    // private stuff
    const zenodoApi = 'https://zenodo.org/api/files/';
    const zenodoRecord = 'https://zenodo.org/record/';
    

    // figcaption settings //////////////////
    let figcaptionHeight = '30px';
    let figcaptions = [];
    let figcaptionLength;

    let facets;

    let data = {
        numOfFoundRecords: 0,
        figures: [],
        prev: '',
        next: ''
    };

    let zenodeo;

    /***************************************************/
    /* various page elements that are used in the      */
    /* program logic                                   */
    /***************************************************/
  
    // the form and form button
    let ssForm;
    let ssGo;
    
    // form fields
    let qField;
    let refreshCacheField;

    // various divs and navs
    let urlFlagSelector;
    let communitiesSelector;
    let throbber;
    let footer;
    let wrapper;
    let carousel;
    let carouselContainer;
    let about;
    let aboutLink;
    let aboutClose;

    // Mustache template fragments
    let templateMasonry;
    let templateCarousel;
    let templateTreatmentsFTS;
    let templateTreatment;

    // we use these state variables when toggling about
    let wrapperState;
    let footerState;

    // attribution for map tiles
    let map = {
        url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoicHVua2lzaCIsImEiOiJjajhvOXY0dW8wMTA3MndvMzBlamlhaGZyIn0.3Ye8NRiiGyjJ1fud7VbtOA'
    }

    const urlcodec = {
        
        schema: {
            singles: {
                treatmentId: {
                    default: '',
                    rules: 'uuid'
                },
                format: {
                    default: 'html',
                    rules: 'string'
                },
                q: {
                    default: '',
                    rules: 'string'
                },
                refreshCache: {
                    default: false,
                    rules: ['boolean']
                },
                resultType: {
                    default: 'treatments',
                    rules: ['required', { 'in': ['treatments', 'images'] }]
                },
                page: {
                    default: 1,
                    rules: ['required', 'integer', 'min:1']
                },
                size: {
                    default: 30,
                    valid: ['required', 'integer', 'between:1,30']
                }
            },
            many: {
                community: {
                    default: 'BLR',
                    rules: ['required', { 'in': ['BLR', 'IceDig'] }]
                }
            }
        },

        deconstruct: function(loc) {

            let qsParams = {
                singles: {},
                many: {}
            };

            let hrefArray = loc.substr(1).split('&').map(el => { return decodeURIComponent(el) });
            
            const singles = Object.keys(urlcodec.schema.singles);
            const many = Object.keys(urlcodec.schema.many);
            for (let i = 0, j = hrefArray.length; i < j; i++) {
                const [k, v] = hrefArray[i].split('=');

                if (singles.indexOf(k) !== -1) {
                    qsParams.singles[k] = v;
                }
                else if (many.indexOf(k) !== -1) {

                    if (qsParams.many[k]) {
                        qsParams.many[k].push(v);
                    }
                    else {
                        qsParams.many[k] = [v];
                    }

                }
            }

            return qsParams;

        },

        construct: function(k, v) {

            let url = '';
            let qsParams;

            if (location.search) {
                qsParams = this.deconstruct(location.search);
            }
            else {
                qsParams = {
                    singles: {},
                    many: {}
                }
            }

            const singles = Object.keys(urlcodec.schema.singles);
            const many = Object.keys(urlcodec.schema.many);
            if (singles.indexOf(k) !== -1) {
                qsParams.singles[k] = v;
            }
            else if (many.indexOf(k) !== -1) {

                if (k === 'community') {

                    // remove any existing "community" key
                    delete qsParams.many.community;
                    
                    if (v === 'all communities') {
                        
                        // add all the communities
                        qsParams.many.community = urlcodec.schema.many.community.rules[1].in
                    }
                    else {

                        for (let i = 0, j = urlFlagSelector.length; i < j; i++) {

                            const element = urlFlagSelector[i];
                            
                            if (element.name === 'community') {
                                
                                if (element.checked) {

                                    if (qsParams.many.community) {
                                        qsParams.many.community.push(element.value);
                                    }
                                    else {
                                        qsParams.many.community = [element.value];
                                    }
                                    
                                }
                                else {
                                    if (qsParams.many.community) {
                                        const ic = qsParams.many.community.indexOf(element.value);
                                        if (ic !== -1) {
                                            qsParams.many.community.splice(ic, 1);
                                        }
                                    }
                                }

                            }
                    
                        }
                        
                    }
                }

            }

            let hrefArray = [];
            for (let key in qsParams.singles) {
                hrefArray.push(key + '=' + qsParams.singles[key]);
            }

            for (let key in qsParams.many) {
                const keyVals = qsParams.many[key];
                for (let i = 0, j = keyVals.length; i < j; i++) {
                    hrefArray.push(key + '=' + keyVals[i])
                }
            }

            history.pushState('', '', '?' + hrefArray.join('&'))
        }

    };

    const getQueryParamsAndImages = function(search) {

        const qsParams = urlcodec.deconstruct(location.search);

        if (qsParams.singles.q) {
            qField.value = qsParams.singles.q;
        }
        
        if (qsParams.singles.refreshCache === 'true') {
            refreshCacheField.checked = true;
        }
        
        for (let i = 0, j = urlFlagSelector.length; i < j; i++) {
            const urlFlagField = urlFlagSelector[i];
            if (qsParams.singles.resultType) {
                
                if (urlFlagField.name === 'resultType') {

                    if (urlFlagField.value === qsParams.singles.resultType) {
                        urlFlagField.checked = true;
                        const rtLabels = resultTypeChooser.querySelectorAll('label');
                        const rtInputs = resultTypeChooser.querySelectorAll('input');

                        for (let i = 0; i < rtLabels.length; i++) {
                            if (urlFlagField.value === rtInputs[i].value) {
                                rtLabels[i].classList.add('searchFocus');
                            }
                            else {
                                rtLabels[i].classList.remove('searchFocus');
                            }
                        }
                    }
                }

                else if (urlFlagField.name === 'community') {
                    if (qsParams.many.community) {
                        const ic = qsParams.many.community.indexOf(urlFlagField.value);
                        //console.log(ic)
                        if (ic !== -1) {
                            if (urlFlagField.value === qsParams.many.community[ic]) {
                                urlFlagField.checked = true;
                            }
                        }
                    }
                }
            }
        }
    };
    
    const makeLayout = function(imagesOfRecords) {
        
        let imgCount = 0;
        let figures = [];
    
        for (let record in imagesOfRecords) {
            
            const images = imagesOfRecords[record]["images"];
            const j = images.length;
            imgCount = imgCount + j;
            const recId = record.split('/').pop();

            let imgBlur; // 10 pixels wide
            let imgA; // 250 pixels wide
            let imgB; // 400
            let imgC; // 960
            let imgD; // 1200

            if (imagesOfRecords[record]["thumb250"] === 'na') {
                imgBlur = imgA = imgB = imgC = imgD = 'img/kein-preview.png';
            }
            else {
                imgA = imagesOfRecords[record]["thumb250"];
                imgBlur = imgA.replace('250', '10');
                imgB = imgA.replace('250,', '400,');
                imgC = imgA.replace('250,', '960,');
                imgD = imgA.replace('250,', '1200,');
            }

            const figure = {
                title: imagesOfRecords[record]["title"],
                creators: imagesOfRecords[record]["creators"],
                recId: recId,
                zenodoRecord: zenodoRecord + recId,
                imageSrc: images[0],
                imgBlur: imgBlur,
                imgA: imgA,
                imgB: imgB,
                imgC: imgC,
                imgD: imgD
            };
            
            figures.push(figure)
        }
    
        return [figures, imgCount];
    };

    const resources = {

        'treatment': function(event) {
            
            
            const qsParams = urlcodec.deconstruct(location.search);
            console.log(qsParams);
            let treatmentId = qsParams.singles.treatmentId;
            let format = qsParams.singles.format;
            let refreshCache = qsParams.singles.refreshCache;

            let href1 = `treatmentId=${treatmentId}`;
            
            if (refreshCache === 'true') {
                href1 += '&refreshCache=true';
            }

            if (format === 'xml') {
                href1 += `&format=xml`;
            }
        
            history.pushState('', '', `?${href1}`);
            href1 = `${zenodeo}/v2/treatments?${href1}`;

            console.log(`href1: ${href1}`)

            const callback = function(xh) {
    
                const data = xh.value;
                console.log(data)

                if (format === 'xml') {
                    return data;
                }
                else {
                    let imgCount = 0;
                    [data.figures, imgCount] = makeLayout(xh.value.images.images);

                    wrapper.innerHTML = Mustache.render(templateTreatment, data);
                    wrapper.className = 'on';
                    footer.className = 'relative';

                    throbber.classList.remove('throbber-on');
                    throbber.classList.add('throbber-off');

                    if (data.numOfFoundRecords !== 'Zero') {
                        const figs = document.querySelectorAll('figcaption > a');
                        
                        for (let i = 0, j = figs.length; i < j; i++) {
                            figs[i].addEventListener('click', toggleFigcaption);
                        }
                    }

                    if (data.materialCitations) {

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
                        data.materialCitations.forEach(mc => {
                            const marker = L.marker([mc.latitude, mc.longitude]).addTo(mcmap);
                            marker.bindPopup(mc.typeStatus);
                            markers.push(marker)
                        })
                        
                        mcmap.fitBounds(new L.featureGroup(markers).getBounds());
                    }
                    else {
                        document.querySelector('#map').classList.add('off-none');
                    }
                }
    
            };
    
            x(href1, callback);

            return false;

        },

        'iort': function() {
            
            const qsParams = urlcodec.deconstruct(location.search);

            // We need three hrefs:
            // 1. 'href1' is sent to zenodeo to fetch 
            // the result
            let params = [];
            for (let k in qsParams.singles) {
                params.push(`${k}=${qsParams.singles[k]}`)
            }

            for (let i = 0, j = qsParams.many.community.length; i < j; i++) {
                params.push(`community=${qsParams.many.community[i]}`)
            }

            let href3 = params.join('&')
            
            let params2 = [];
            if (qsParams.singles.resultType === 'images') {
                params2.push('access_right=open')
                params2.push('type=image')
            }

            let stub = `${zenodeo}/v2/${qsParams.singles.resultType}`;
            delete qsParams.singles['resultType'];
            
            for (let k in qsParams.singles) {
                params2.push(`${k}=${qsParams.singles[k]}`)
            }

            let href1 = params2.join('&')
        
            // 2. 'href2' is attached to 'prev' and 'next' 
            // links with the correctly decremented or  
            // incremented page number
            let href2 = href1
            href1 = `${stub}?${href1}`;
    
            // 3. 'href3' is displayed in the browser URL 
            // bar via `history.pushState()`
            history.pushState('', '', `?${href3}`);
    
            const callback = function(xh) {
    
                const res = xh.value;
                let numOfFoundRecords = res.total || res.length;
                
                let imgCount = 0;

                let template;
                
                if (res.images) {
                    template = templateMasonry;
                    [data.figures, imgCount] = makeLayout(res.images);
                }
                else {
                    template = templateTreatmentsFTS;
                    data.treatments = res;
                }
    
                
                data.numOfFoundRecords = niceNumbers(numOfFoundRecords);
    
                if (numOfFoundRecords) {
                    const page = qsParams.singles.page;
                    if (numOfFoundRecords >= 30) {
                        data.prev = (page === 1) ? `?${href2}&page=1` : `?${href2}&page=${page - 1}`;
                        data.next = `?${href2}&page=${(parseInt(page) + 1)}`;
                        data.pager = true;
                    }
    
                    footer.className = 'relative';
                }
                else {
                    data.numOfFoundRecords = 'Zero';
                    data.pager = false;
                    footer.className = 'fixed';
                }
    
                wrapper.innerHTML = Mustache.render(template, data);            
                wrapper.className = 'on';
                throbber.classList.remove('throbber-on');
                throbber.classList.add('throbber-off');
    
                if (res.images) {
                    if (data.numOfFoundRecords !== 'Zero') {
                        const figs = document.querySelectorAll('figcaption > a');
                        
                        for (let i = 0, j = figs.length; i < j; i++) {
                            figs[i].addEventListener('click', toggleFigcaption);
                        }
                    }
                }
                else {
                    const treatmentLinks = document.querySelectorAll('.treatmentLink');
    
                    for (let i = 0, j = treatmentLinks.length; i < j; i++) {
                        treatmentLinks[i].addEventListener('click', resources['treatment']);
                    }
                }
    
            };
    
            x(href1, callback);
            
            return false;
        },
        
        'citations': function() {
        }
    };

    const x = function(url, callback) {

        const method = 'GET';
        const headers = [
            {k: "Content-Type", v: "application/json;charset=UTF-8"}
        ];
        const payload = '';

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

    const toggleFigcaption = function(event) {

        // find and store all the figcaptions on the page in an array
        // This is done only once since figcaptions is a global var
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
    
    const currentYPosition = function() {
    
        // Firefox, Chrome, Opera, Safari
        if (self.pageYOffset) {
            return self.pageYOffset;
        }
    
        // Internet Explorer 6 - standards mode
        if (document.documentElement && document.documentElement.scrollTop) {
            return document.documentElement.scrollTop;
        }
        
        // Internet Explorer 6, 7 and 8
        if (document.body.scrollTop) {
            return document.body.scrollTop;
        }
    
        return 0;
    };
    
    const smoothScroll = function(stopY) {
        const startY = currentYPosition();
        const distance = stopY > startY ? stopY - startY : startY - stopY;
    
        if (distance < 100) {
            scrollTo(0, stopY);
            return;
        }
    
        let speed = Math.round(distance / 100);
        if (speed >= 10) {
            speed = 10;
        }
    
        const step = Math.round(distance / 25);
        let leapY = stopY > startY ? startY + step : startY - step;
        let timer = 0;
        if (stopY > startY) {
            for (let i = startY; i < stopY; i += step) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; 
                if (leapY > stopY) {
                    leapY = stopY; 
                    timer++;
                }
            }
    
            return;
        }
    
        for (let i = startY; i > stopY; i -= step) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step;
            if (leapY < stopY) {
                leapY = stopY; 
                timer++;
            }
        }
    };

    const autoc = function(field) {

        new autoComplete({
            selector: field,
            minChars: 3,
            source: function(term, response) {
                try { x.abort() } catch(e) {}
                
                x(`${zenodeo}/v2/families?q=${term}`, response)
            }
        });
        
    }

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
            '9': 'Nine',
            '10': 'Ten'
        };

        if (num in nums) {
            return nums[num];
        }
        else {
            return num;
        }
    };

    //+creators.name:/Agosti.*/ +publication_date:[1990 TO 1991} +keywords:taxonomy +title:review
    const goGetIt = function(event) {

        event.preventDefault();
        event.stopPropagation();

        if (qField.value) {

            qField.placeholder = "search for something";
            qField.classList.remove('warning');
            throbber.classList.remove('throbber-off');
            throbber.classList.add('throbber-on');

            urlcodec.construct('q', qField.value);
            urlcodec.construct('page', 1);
            urlcodec.construct('size', 30);
            
            for (let i = 0, j = urlFlagSelector.length; i < j; i++) {
                const element = urlFlagSelector[i];
                if (element.name === 'resultType') {
                    if (element.checked === true) {
                        urlcodec.construct('resultType', element.value);
                    }
                }
                else if (element.name === 'community') {
                    if (element.value !== 'all communities') {
                        if (element.checked === true) {
                            urlcodec.construct('community', element.value);
                        }
                    }
                }
            }

           resources['iort']()
            
        }
        else {
            qField.placeholder = "c'mon, enter something";
            qField.classList.add('warning');
        }
    };

    /*
    const goGetIt = function(event) {

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        
        
            // from button=go
            // or from clicking on 'resultTypeChooser'
            if (qField.value) {

                qField.placeholder = "search for something";
                qField.classList.remove('warning');
                throbber.classList.remove('throbber-off');
                throbber.classList.add('throbber-on');

                urlcodec.construct('q', qField.value);
                urlcodec.construct('page', 1);
                urlcodec.construct('size', 30);
                
                for (let i = 0, j = urlFlagSelector.length; i < j; i++) {
                    const element = urlFlagSelector[i];
                    if (element.name === 'resultType') {
                        if (element.checked === true) {
                            urlcodec.construct('resultType', element.value);
                        }
                    }
                    else if (element.name === 'community') {
                        if (element.value !== 'all communities') {
                            if (element.checked === true) {
                                urlcodec.construct('community', element.value);
                            }
                        }
                    }
                }

                resources['iort']()
                
            }
            else {
                qField.placeholder = "c'mon, enter something";
                qField.classList.add('warning');
            }
        }
        else if (location.search) {

        }
    };
    */

    const toggleAbout = function(event) {

        if (about.classList.contains('on')) {

            // hide about
            about.classList.remove('on');
            about.classList.add('off-none');

            // restore wrapper and footer
            footer.className = footerState;
            wrapper.className = wrapperState;
        }
        else {
            
            // save wrapper and footer state
            wrapperState = wrapper.className;
            footerState = footer.className;

            // hide wrapper
            wrapper.className = 'off-none';

            // make footer fixed
            footer.className = 'fixed';

            // make about visible
            about.classList.remove('off-none');
            about.classList.add('on');
        }
    };

    const foo = function (element) {
        
        let k;
        let v;

        if (element.name === 'community') {

            const communityCheckBoxes = document.querySelectorAll('input[name="community"]');

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
                document.querySelector('input[value="all communities"]').checked = false;
            }
        }
        else if (element.name === 'resultType') {

            const rtLabels = resultTypeChooser.querySelectorAll('label');
            const rtInputs = resultTypeChooser.querySelectorAll('input');

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

    // public stuff
    return {

        carousel: function() {

            wrapper.className = 'off-none';
            carousel.innerHTML = Mustache.render(templateCarousel, data);
            carouselContainer.className = 'on';

            const carouselOff = document.querySelectorAll('.carouselOff');
            for (let i = 0, j = carouselOff.length; i < j; i++) {
                carouselOff[i].addEventListener('click', Ocellus.carouselOff);
            }
        },

        carouselOff: function() {
            carouselContainer.className = 'off-none';
            wrapper.className = 'on';
        },

        
        /*
         * Initialization options
         * 
         * { 
         *     zenodeo: <path to zenodeo service>,
         *     layout: <'masonry' | 'grid'>
         *     facets: {}
         * }
         * 
         */
        init: function(options) {

            // store the options in private variables for later use
            zenodeo = options.zenodeo;

            ssGo = options.ssGo;
            ssForm = options.ssForm;

            // if (options.facets) {
            //     facets = options.facets;
            // }

            qField = options.qField;
            refreshCacheField = options.refreshCacheField;

            urlFlagSelector = options.urlFlagSelector;
            communitiesSelector = options.communitiesSelector;
            throbber = options.throbber;
            footer = options.footer;
            wrapper = options.wrapper;
            carousel = options.carousel;
            carouselContainer = options.carouselContainer;
            about = options.about;
            aboutLink = options.aboutLink;
            aboutClose = options.aboutClose;

            templateMasonry = options.templateMasonry;
            templateCarousel = options.templateCarousel;
            templateTreatmentsFTS = options.templateTreatmentsFTS;
            templateTreatment = options.templateTreatment;

            communitiesSelector.addEventListener('click', function(event){
                communitiesSelector.classList.toggle('open');
            });

            for (let i = 0, j = urlFlagSelector.length; i < j; i++) {

                const element = urlFlagSelector[i];
                element.addEventListener('click', function(event) {

                        foo(element);
                    
                        if (element.name === 'communities') {
                            communitiesSelector.classList.remove('open');
                        }
        
                })
            }
            
            aboutLink.addEventListener('click', toggleAbout);
            aboutClose.addEventListener('click', toggleAbout);
            ssGo.addEventListener('click', goGetIt);
            ssForm.addEventListener('submit', goGetIt);

            autoc(qField)

            if (location.search) {
                getQueryParamsAndImages(location.search);
            }
        }
    }
}());