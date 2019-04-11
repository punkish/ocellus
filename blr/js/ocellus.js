'use strict';

const Ocellus = (function() {
    
    // private stuff
    const basePath = '/v2/records?size=30&communities=biosyslit&access_right=open&type=image&';
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
    let layout;
    let baseUrl;

    let ssGo;
    let ssForm;

    let q;
    let resultType;
    let communities;
    let refreshCache;
    //let qValue;

    let resultTypeChooser;
    let throbber;
    let footer;
    let wrapper;
    let carousel;
    let carouselContainer;
    let about;
    let aboutLink;
    let aboutClose;

    let templateMasonry;
    let templateCarousel;
    let templateTreatmentsFTS;
    let templateTreatment;

    // we use these when toggling about
    let wrapperState;
    let footerState;

    const getQueryStr = function(qStr) {
        let qryStr = {};
        qStr.substr(1)
            .split('&')
            .forEach(function(el) {
                qryStr[el.split('=')[0]] = el.split('=')[1];
            });
    
        return qryStr;
    };
    
    const getQueryParamsAndImages = function(search) {

        const qryStr = getQueryStr(search);
        //qValue = qryStr['q'];
    
        getImages(
            qryStr['q'],            // qry 
            qryStr['page'],         // page, 
            qryStr['refreshCache']  // refreshCache
        );
    };
    
    const makeLayout = function(imagesOfRecords) {
        
        let imgCount = 0;
        let figures = [];
    
        for (let record in imagesOfRecords) {
            
            const images = imagesOfRecords[record]["images"];
            const j = images.length;
            imgCount = imgCount + j;
            const recId = record.split('/').pop();

            let imgA; // 250 pixels wide
            let imgB; // 400
            let imgC; // 960
            let imgD; // 1200
            if (imagesOfRecords[record]["thumb250"] === 'na') {
                imgA = imgB = imgC = imgD = 'img/kein-preview.png';
            }
            else {
                imgA = imagesOfRecords[record]["thumb250"];
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
                imgA: imgA,
                imgB: imgB,
                imgC: imgC,
                imgD: imgD
            };
            
            figures.push(figure)
        }
    
        return [figures, imgCount];
    };
    
    const getImages = function(opts) {

        const q = opts.q;
        //const resultType = opts.resultType;
        const page = opts.page;
        const refreshCache = opts.refreshCache;

        const method = 'GET';
        
        // we attach qStr1 to 'prev' and 'next' links 
        // with the correctly decremented or  
        // incremented page number
        let qStr1 = `size=30&communities=biosyslit&access_right=open&type=image&q=${q}`;
        
        if (refreshCache === 'true') {
            qStr1 += `&refreshCache=${refreshCache}`;
        }
    
        // qStr2 is used for `history` and the address
        // shown in the browser's URL field
        let qStr2;

        // the complete url to the api
        let url;
        qStr1 = qStr1 + '&page=';
        qStr2 = qStr1 + page;
        url = zenodeo + '/v2/records?' + qStr2;

        history.pushState('', '', '?' + qStr2);

        let qStr3 = `resultType=${resultType.value}&${qStr1}`

        const callback = function(xh) {

            const res = JSON.parse(xh.responseText).value;

            if (res.total) {
                const [figures, imgCount] = makeLayout(res.images);
                data.figures = figures;
                data.numOfFoundRecords = niceNumbers(res.total);

                if (imgCount >= 30) {
                    data.prev = (page === 1) ? '?' + qStr3 + 1 : '?' + qStr3 + (page - 1);
                    data.next = '?' + qStr3 + (parseInt(page) + 1);
                    data.pager = true;
                }

                footer.className = 'relative';
                
            }
            else {
                data.numOfFoundRecords = 'Zero';
                data.pager = false;
                footer.className = 'fixed';
            }

            //qField.value = qValue;
            wrapper.innerHTML = Mustache.render(templateMasonry, data);
            wrapper.className = 'on';
            throbber.classList.remove('throbber-on');
            throbber.classList.add('throbber-off');

            if (data.numOfFoundRecords !== 'Zero') {
                const figs = document.querySelectorAll('figcaption > a');
                // const reporters = document.querySelectorAll('.report');
                // const submitters = document.querySelectorAll('.submit');
                // const cancellers = document.querySelectorAll('.cancel');
        
                let i = 0;
                let j = figs.length;
                for (; i < j; i++) {
                    figs[i].addEventListener('click', toggleFigcaption);
                    // reporters[i].addEventListener('click', toggleReporter);
                    // submitters[i].addEventListener('click', submitReporter);
                    // cancellers[i].addEventListener('click', cancelReporter);
                }
            }
        };
        const headers = [
            {k: "Content-Type", v: "application/json;charset=UTF-8"}
        ];
        const payload = '';

        x(method, url, callback, headers, payload);
        
        return false;
    };

    const getTreatments = function(opts) {

        const q = opts.q;
        //const resultType = opts.resultType;
        const page = opts.page;
        const refreshCache = opts.refreshCache;

        const method = 'GET';
        
        // we attach qStr1 to 'prev' and 'next' links 
        // with the correctly decremented or  
        // incremented page number
        let qStr1 = `q=${q}`;
        
        if (refreshCache === 'true') {
            qStr1 += `&refreshCache=${refreshCache}`;
        }
    
        // qStr2 is used for `history` and the address
        // shown in the browser's URL field
        //let qStr2;
    
        // the complete url to the api
        let url;
        //qStr2 = qStr1;
        url = zenodeo + '/v2/treatments/?' + qStr1;

        history.pushState('', '', '?' + `resultType=${resultType.value}&${qStr1}`);

        const callback = function(xh) {

            const res = JSON.parse(xh.responseText).value;

            if (res.length) {
                data.treatments = res;
                // const [figures, imgCount] = makeLayout(res.images);
                // data.figures = figures;
                // data.numOfFoundRecords = niceNumbers(res.total);

                // if (imgCount >= 30) {
                //     data.prev = (page === 1) ? '?' + qStr1 + 1 : '?' + qStr1 + (page - 1);
                //     data.next = '?' + qStr1 + (parseInt(page) + 1);
                //     data.pager = true;
                // }

                footer.className = 'relative';
                
            }
            else {
                data.numOfFoundRecords = 'Zero';
                data.pager = false;
                footer.className = 'fixed';
            }

            wrapper.innerHTML = Mustache.render(templateTreatmentsFTS, data);
            wrapper.className = 'on';
            const treatmentLinks = document.querySelectorAll('.treatmentLink');
   
            for (let i = 0, j = treatmentLinks.length; i < j; i++) {
                treatmentLinks[i].addEventListener('click', getTreatment);
            }

            throbber.classList.remove('throbber-on');
            throbber.classList.add('throbber-off');

        };
        const headers = [
            {k: "Content-Type", v: "application/json;charset=UTF-8"}
        ];
        const payload = '';

        x(method, url, callback, headers, payload);
        
        return false;
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

    const x = function(method, url, callback, headers, payload) {
        const xh = new XMLHttpRequest();

        xh.onload = function(e) {
            if (xh.readyState === 4) {
                if (xh.status === 200) {
                    callback(xh);
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

    const xhr = function(href, cb) {
        let x = new XMLHttpRequest();

        x.onload = function(event) {
            if (x.readyState === 4) {
                if (x.status === 200) {
                    const res = JSON.parse(x.responseText);
                    cb(res);
                }
            }
        };

        x.onerror = function(e) {
            console.error(x.statusText);
        };

        x.open("GET", href, true);
        x.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        x.send();
    };

    const autoc = function(field) {

        const headers = [
            {k: "Content-type", v: "application/json"}
        ]

        //let xhr;

        new autoComplete({
            selector: field,
            minChars: 3,
            source: function(term, response) {
                try { xhr.abort() } catch(e) {}
                xhr(`${zenodeo}/v2/families?q=${term}`, response)
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

        throbber.classList.remove('throbber-off');
        throbber.classList.add('throbber-on');
        
        if (resultType.value === 'images') {
            getImages({ 
                q: q.value.toLowerCase(),
                //resultType: resultType.value,
                page: 1,
                refreshCache: refreshCache.value
            });
        }
        else if (resultType.value === 'treatments') {
            getTreatments({ 
                q: q.value.toLowerCase(),
                //resultType: resultType.value,
                page: 1,
                refreshCache: refreshCache.value
            });
        }

    };

    const getTreatment = function(event) {
        event.preventDefault();
        event.stopPropagation();

        const search = event.target.search.substr(1).split('&');
        let qry = {};
        search.forEach(el => {
            const a = el.split('=')
            qry[ a[0] ] = a[1] 
        })
        
        let qStr1 = `resultType=treatments&treatmentId=${qry.treatmentId}`;
        let url = `${zenodeo}/v2/treatments?treatmentId=${qry.treatmentId}`;
        history.pushState('', '', '?' + qStr1);
        const method = 'GET';
        const callback = function(xh) {

            const data = JSON.parse(xh.responseText).value;

            wrapper.innerHTML = Mustache.render(templateTreatment, data);
            wrapper.className = 'on';
            throbber.classList.remove('throbber-on');
            throbber.classList.add('throbber-off');

        };
        const headers = [
            {k: "Content-Type", v: "application/json;charset=UTF-8"}
        ];
        const payload = '';

        x(method, url, callback, headers, payload);
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

    const chooseResultType = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // https://stackoverflow.com/questions/4564414/delete-first-character-of-a-string-in-javascript
        const s = event.target.hash.substr(1);
        resultType.value = s;

        for (let i = 0; i < resultTypeChooser.children.length; i++) {

            if (s === resultTypeChooser.children[i].hash.substr(1)) {
                resultTypeChooser.children[i].classList.add('searchFocus');
            }
            else {
                resultTypeChooser.children[i].classList.remove('searchFocus');
            }
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
            layout = options.layout;

            ssGo = options.ssGo;
            ssForm = options.ssForm;

            // if (options.facets) {
            //     facets = options.facets;
            // }

            q = options.q;
            resultType = options.resultType;
            communities = options.communities;
            refreshCache = options.refreshCache;

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

            if (location.search) {
                getQueryParamsAndImages(location.search);
            }

            aboutLink.addEventListener('click', toggleAbout);
            aboutClose.addEventListener('click', toggleAbout);
            ssGo.addEventListener('click', goGetIt);
            ssForm.addEventListener('submit', goGetIt);

            for (let i = 0; i < resultTypeChooser.children.length; i++) {
                resultTypeChooser.children[i].addEventListener('click', chooseResultType)
            }

            autoc(q)

            baseUrl = zenodeo + basePath;
        }
    }
}());