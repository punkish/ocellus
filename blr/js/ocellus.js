'use strict';

const Ocellus = (function() {
    
    // private stuff
    // const basePath = '/v2/records?size=30&communities=biosyslit&access_right=open&type=image&';
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
    let resultTypeField;
    let pageField;
    let sizeField;
    let communitiesField;
    let refreshCacheField;

    // various divs and navs
    let communitiesSelector;
    let resultTypeChooser;
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
    
    const tagResultTypeChooser = function(resultType) {

        resultTypeField.value = resultType;
        for (let i = 0; i < resultTypeChooser.children.length; i++) {

            if (resultType === resultTypeChooser.children[i].hash.substr(1)) {
                resultTypeChooser.children[i].classList.add('searchFocus');
            }
            else {
                resultTypeChooser.children[i].classList.remove('searchFocus');
            }
        }
    };

    const getQueryParamsAndImages = function(search) {

        let options = {};
        search.substr(1)
            .split('&')
            .forEach(function(el) {
                options[el.split('=')[0]] = el.split('=')[1];
            });

        if (options.q) qField.value = options.q;
        resultTypeField.value = options.resultType;

        tagResultTypeChooser(options.resultType)
        
        let resource = options.resultType;
        if (options.treatmentId) {
            resource = 'treatment'
        }
        else {
            resource = 'iort'
        }
        resources[resource](options)
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

        'treatment': function(options) {

            let treatmentId = options.treatmentId;
            let format = options.format;
            let refreshCache = options.refreshCache;
            let href1 = `treatmentId=${treatmentId}`;
            
            if (refreshCache === 'true') {
                href1 += '&refreshCache=true';
            }

            if (format) {
                href1 += `&format=${format}`;
            }
        

            history.pushState('', '', `?${href1}`);
            href1 = `${zenodeo}/v2/treatments?${href1}`;

            
            
            const callback = function(xh) {
    

                const data = xh.value;

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

                        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                            maxZoom: 18,
                            id: 'mapbox.streets',
                            accessToken: 'pk.eyJ1IjoicHVua2lzaCIsImEiOiJjajhvOXY0dW8wMTA3MndvMzBlamlhaGZyIn0.3Ye8NRiiGyjJ1fud7VbtOA'
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

        },

        'iort': function(options) {
            
            // We need three hrefs:
            // 1. 'href1' is sent to zenodeo to fetch 
            // the result
            let params = [];
            for (let k in options) {
                params.push(`${k}=${options[k]}`)
            }

            let href3 = params.join('&')
            
            let params2 = [];
            if (options.resultType === 'images') {
                params2.push('access_right=open')
                params2.push('type=image')
            }

            let stub = `${zenodeo}/v2/${options.resultType}`;
            delete options['resultType'];
            
            for (let k in options) {
                params2.push(`${k}=${options[k]}`)
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
                let numOfFoundRecords = res.total;
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
                    if (numOfFoundRecords >= 30) {
                        data.prev = (options.page === 1) ? `?${href2}&page=1` : `?${href2}&page=${options.page - 1}`;
                        data.next = `?${href2}&page=${(parseInt(options.page) + 1)}`;
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

            throbber.classList.remove('throbber-off');
            throbber.classList.add('throbber-on');

            const options = {
                q: qField.value,
                resultType: resultTypeField.value,
                communities: communitiesField.value,
                refreshCache: refreshCacheField.value,
                page: pageField.value,
                size: sizeField.value
            };

           resources['iort'](options)
            
        }
    };

    const chooseResultType = function(event) {
        
        // https://stackoverflow.com/questions/4564414/delete-first-character-of-a-string-in-javascript

        tagResultTypeChooser(event.target.hash.substr(1))
        goGetIt(event)
    };

    const toggleRefreshCache = function(event) {
            
        const toggleClass = event.target.dataset['toggleClass'];
        const toggleTarget = document.querySelector(event.target.dataset['toggleTarget']);

        if (event.target['checked']) {
            toggleTarget.classList.remove(toggleClass);
            toggleTarget.classList.add('on');
        }
        else {
            toggleTarget.classList.remove('on');
            toggleTarget.classList.add(toggleClass);
        }
    };

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
            resultTypeField = options.resultTypeField;
            pageField = options.pageField;
            sizeField = options.sizeField;
            communitiesField = options.communitiesField;
            refreshCacheField = options.refreshCacheField;

            communitiesSelector = options.communitiesSelector;
            resultTypeChooser = options.resultTypeChooser;
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

            const csa = communitiesSelector.querySelectorAll('li a');
            for (let i = 0; i < csa.length; i++) {
                csa[i].addEventListener('click', function(event) {
                    event.stopPropagation();
                    communitiesField.value = event.currentTarget.innerText;
                    communitiesSelector.classList.remove('open');
                })
            }

            aboutLink.addEventListener('click', toggleAbout);
            aboutClose.addEventListener('click', toggleAbout);
            ssGo.addEventListener('click', goGetIt);
            ssForm.addEventListener('submit', goGetIt);

            for (let i = 0; i < resultTypeChooser.children.length; i++) {
                resultTypeChooser.children[i].addEventListener('click', chooseResultType)
            }

            autoc(qField)

            if (location.search) {
                getQueryParamsAndImages(location.search);
            }
        }
    }
}());