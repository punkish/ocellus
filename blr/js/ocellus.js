'use strict';

const Ocellus = (function() {
    
    // private stuff
    let zenodeo = 'https://zenodeo.punkish.org';
    const basePath = '/v2/records?size=30&communities=biosyslit&access_right=open&type=image&summary=false&images=true&';
    let baseUrl;
    const zenodoApi = 'https://zenodo.org/api/files/';
    const zenodoRecord = 'https://zenodo.org/record/';
    
    let layout = 'masonry';

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

    let qField;
    let qValue;
    let templateMasonry;
    let templateCarousel;
    let carouselContainer;
    let carousel;
    let wrapper;
    let throbber;
    let footer;
    let about;
    let aboutLink;
    let aboutClose;
    let ssGo;

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
        qValue = qryStr['q'];
    
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
    
    const getImages = function(qValue, page, refreshCache) {
        
        // we attach qStr1 to 'prev' and 'next' links 
        // with the correctly decremented or  
        // incremented page number
        let qStr1 = 'q=' + qValue;
        
        if (refreshCache) {
            qStr1 = qStr1 + '&refreshCache=' + refreshCache;
        }
    
        qStr1 = qStr1 + '&page=';
    
        // qStr2 is used for `history`
        let qStr2 = qStr1 + page;
    
        const method = 'GET';
        // the complete url to the api
        let url = baseUrl + qStr2;
        const callback = function(xh) {

            const res = JSON.parse(xh.responseText);

            if (res.total) {
                const [figures, imgCount] = makeLayout(res.result);
                data.figures = figures;
                data.numOfFoundRecords = niceNumbers(res.total);

                if (imgCount >= 30) {
                    data.prev = (page === 1) ? '?' + qStr1 + 1 : '?' + qStr1 + (page - 1);
                    data.next = '?' + qStr1 + (parseInt(page) + 1);
                    data.pager = true;
                }

                footer.className = 'relative';
                history.pushState('', '', '?' + qStr2);
            }
            else {
                data.numOfFoundRecords = 'Zero';
                data.pager = false;
                footer.className = 'fixed';
            }

            qField.value = qValue;
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
    }

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

        //+creators.name:/Agosti.*/ +publication_date:[1990 TO 1991} +keywords:taxonomy +title:review
        goGetIt: function(options) {
            
            qValue = options.qValue;
            getImages( 
                qValue.toLowerCase(), // qry
                1,                    // page
                options.refreshCache, // refreshCache
            );
        },

        toggleRefreshCache: function(event) {
            
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
        },

        toggleAbout: function(event) {

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
            if (options.zenodeo) {
                zenodeo = options.zenodeo;
            }
            baseUrl = options.zenodeo + basePath;

            if (options.layout) {
                layout = options.layout;
            }

            if (options.facets) {
                facets = options.facets;
            }

            qField = options.qField;
            templateMasonry = options.templateMasonry;
            wrapper = options.wrapper;
            templateCarousel = options.templateCarousel;
            carouselContainer = options.carouselContainer;
            carousel = options.carousel;
            throbber = options.throbber;
            footer = options.footer;
            about = options.about;
            aboutLink = options.aboutLink;
            aboutClose = options.aboutClose;
            ssGo = options.ssGo;
            ssForm = options.ssForm;

            if (location.search) {
                getQueryParamsAndImages(location.search);
            }

            aboutLink.addEventListener('click', Ocellus.toggleAbout);
            aboutClose.addEventListener('click', Ocellus.toggleAbout);
            ssGo.addEventListener('click', Ocellus.goGetItWrapper);
            ssForm.addEventListener('submit', Ocellus.goGetItWrapper);
        }
    }
}());
