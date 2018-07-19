'use strict';

const Ocellus = (function() {
    
    // private stuff
    let zenodeo = 'https://zenodeo.punkish.org';
    const basePath = '/v1/records?size=30&communities=biosyslit&access_right=open&type=image&summary=false&images=true&';
    let baseUrl = zenodeo + basePath;
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
    let wrapper;
    let throbber;
    let footer;
    let about;

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
        q = qryStr['q'];
    
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
    
        // the complete url to the api
        let url = baseUrl + qStr2;

        let x = new XMLHttpRequest();
    
        x.onload = function(event) {
            if (x.readyState === 4) {
                if (x.status === 200) {
                    const res = JSON.parse(x.responseText);

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
                
                        let i = 0;
                        let j = figs.length;
                        for (; i < j; i++) {
                            figs[i].addEventListener('click', toggleFigcaption);
                        }
                    }
                }
            }
        };
    
        x.onerror = function(e) {
            console.error(x.statusText);
        };
    
        x.open("GET", url, true);
        x.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        x.send();
        
        return false;
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

            (function() {
                var bLazy = new Blazy({
                    breakpoints: [
                        { width: 375, src: "data-src-a" },
                        { width: 414, src: "data-src-b" },
                        { width: 1024, src: "data-src-c" },
                        { width: 1280, src: "data-src-d" }
                    ]
                });
            })();
            
            wrapper.className = 'off-none';
            carousel.innerHTML = Mustache.render(templateCarousel, data);
            carousel.className = 'on';

            // scrollmagic
            var controller = new ScrollMagic.Controller();
            const figuresDivs = [].slice.call(document.querySelectorAll('.image-wrapper'));
    
            figuresDivs.forEach(function(el) {
                var typeIndvScene = new ScrollMagic.Scene({
                    triggerElement: el,
                    triggerHook: 0.6
                })
                .setClassToggle(el, "zap")
                .addTo(controller);
            });
            
            //scene = scene.destroy();
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
                baseUrl = options.zenodeo + basePath;
            }

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
            carousel = options.carousel;
            throbber = options.throbber;
            footer = options.footer;
            about = options.about;

            if (location.search) {
                getQueryParamsAndImages(location.search);
            }
        }
    }
}());
