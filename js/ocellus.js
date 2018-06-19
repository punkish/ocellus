//const loc = 'http://localhost:3030';
const loc = 'https://zenodeo.punkish.org';
const baseUrl = loc + '/v1/records?size=30&communities=biosyslit&type=image&summary=false&images=true&';
const imageresizer = 'https://ocacher.punkish.org/';
const zenodoApi = 'https://zenodo.org/api/files/';
const zenodoRecord = 'https://zenodo.org/record/';

let tnsource = 'zenodo';
let defaultLayout = 'masonry';
let htmlCarouselStr = '';

// figcaption height
const fch = '30px';
let figcaptions = [];
let fclength;

let els = {};
["numOfFoundRecords","grid","masonry","cacheMsg","qReqdMsg","cacheMsgCheck","q","qWrapper","throbber","btnImages","aboutLink","about","closeAbout","prev","next","pager","wrapper","html","footer", "carouselbox", "carousel"].forEach(function(el) {
    els[el] = document.getElementById(el);
});

const getQueryStr = function(qStr) {
    let qryStr = {};
    qStr.substr(1)
        .split('&')
        .forEach(function(el) {
            qryStr[el.split('=')[0]] = el.split('=')[1];
        });

    if (qryStr['tnsource']) {
        tnsource = qryStr['tnsource'];
    }

    if (qryStr['layout']) {
        layout = qryStr['layout'];
    }

    return qryStr;
};

const getQueryParamsAndImages = function(event, search) {
    const qryStr = getQueryStr(search);
    els['q'].value = qryStr['q'];

    getImages(
        event, 
        qryStr['q'],            // qry 
        qryStr['page'],         // page, 
        qryStr['refreshCache'], // refreshCache
        qryStr['tnsource'] || '',
        qryStr['layout'] || ''
    );
}

const getImagesFromPager = function(event) {
    els['grid'].innerHTML = '';
    els['footer'].className = 'fixed';
    smoothScroll(0);
    getQueryParamsAndImages(event, this.search);
};

const getImagesFromButton = function(event) {

    getImages(
        event, 
        els['q'].value.toLowerCase(),  // qry
        1,                             // page
        els['cacheMsgCheck'].checked,  // refreshCache
        tnsource,
        defaultLayout
    );
};

const carousel = function() {
    //const re = '(.*?)(250,)(.*)';
    // const thumb960 = thumb250.replace('250,', '960,');
    // let html = '<figure class="item">';
    // html += `<a href="${image}" target="_blank"><img class="z" src="${thumb960}"></a>`;
    // html += `<figcaption class="transition-050 opacity85 text">
    //                 rec ID: <a class="transition-050">${recId}</a>
    //                 <div class="transition-050 desc">${title}. <a href='${zenodoRecord}${recId}' target='_blank'>more</a></div>
    //             </figcaption>
    //         </figure>`;

    els['carousel'].innerHTML = htmlCarouselStr;
    els['carouselbox'].className = 'on';
    lazyload();
    els['masonry'].className = 'off';
    els['grid'].className = 'off';
    els['pager'].className = 'off';
    
    // Read necessary elements from the DOM once
    //var box = document.querySelector('#carouselbox');
    var box = document.getElementById('carouselbox');
    var next = box.querySelector('.next');
    var prev = box.querySelector('.prev');

    // Define the global counter, the items and the 
    // current item 
    var counter = 0;
    var items = box.querySelectorAll('.content figure');
    var amount = items.length;
    var current = items[0];
    // let thumb960 = current.childNodes[0].firstChild.src.replace('250,', '960,');
    //current.childNodes[0].firstChild.src = current.childNodes[0].firstChild.dataset.src;

    box.classList.add('active');

    // navigate through the carousel

    function navigate(direction) {

        // hide the old current list item 
        current.classList.remove('current');
        
        // calculate th new position
        counter = counter + direction;
    
        // if the previous one was chosen
        // and the counter is less than 0 
        // make the counter the last element,
        // thus looping the carousel
        if (direction === -1 && counter < 0) { 
            counter = amount - 1; 
        }
    
        // if the next button was clicked and there 
        // is no items element, set the counter 
        // to 0
        if (direction === 1 && !items[counter]) { 
            counter = 0;
        }
    
        // set new current element 
        // and add CSS class
        current = items[counter];
        // thumb960 = current.childNodes[0].firstChild.src.replace('250,', '960,');
        //current.childNodes[0].firstChild.src = current.childNodes[0].firstChild.dataset.src;
        current.classList.add('current');
    }

    // add event handlers to buttons
    next.addEventListener('click', function(ev) {
        navigate(1);
    });
    prev.addEventListener('click', function(ev) {
        navigate(-1);
    });

    // show the first element 
    // (when direction is 0 counter doesn't change)
    navigate(0);

};

const makeLayout = function(imagesOfRecords) {
    //let html = '';
    let htmlCarousel = '';
    let htmlGrid = '';
    let thumb960 = '';

    let imgCount = 0;
    //let recordCount = 0;
    //const imagesOfRecords = data.imagesOfRecords;

    for (let record in imagesOfRecords) {
        //recordCount = recordCount + 1;

        if (imagesOfRecords[record]["thumb250"]) {
            const images = imagesOfRecords[record]["images"];
            const title = imagesOfRecords[record]["title"];
            const creators = imagesOfRecords[record]["creators"];
            const thumb250 = imagesOfRecords[record]["thumb250"];
            const recId = record.split('/').pop();

            const j = images.length;
            imgCount = imgCount + j;

            htmlCarousel += "<figure>";
            htmlGrid += "<figure class='item'>";


            for (let i = 0; i < j; i++) {
                if (tnsource === 'zenodo') {
                    htmlGrid += `<a href="${images[i]}" target="_blank"><img class="z" src="${thumb250}"></a>`;
                    //htmlGrid += `<a href="#carousel" onclick="carousel();"><img class="z" src="${thumb250}"></a>`;

                    thumb960 = thumb250.replace('250,', '960,');
                    //htmlCarousel += `<a href="${images[i]}" target="_blank"><img data-frz-src="${thumb960}" src="${thumb250}" onload="lzld(this);" onerror="lzld(this);"></a>`;
                    //htmlCarousel += `<a href="${images[i]}" target="_blank"><img data-src="${thumb960}" src="${thumb250}"></a>`;

                    htmlCarousel += `<a href="${images[i]}" target="_blank"><img class="lazyload" src="${thumb250}" data-src="${thumb960}"></a>`;

                }
                else {
                    htmlGrid += `<a href="${images[i]}" target="_blank"><img class="z" src="${imageresizer}${images[i].replace(zenodoApi, '')}"></a>`;
                }
            }

            htmlGrid += `<figcaption class="transition-050 opacity85 text">
                        rec ID: <a class="transition-050">${recId}</a>
                        <div class="transition-050 desc">${title}. <a href='${zenodoRecord}${recId}' target='_blank'>more</a></div>
                    </figcaption>
                </figure>`;

            htmlCarousel += `<figcaption>
                        rec ID: <b>${recId}.</b> ${title}. <a href='${zenodoRecord}${recId}' target='_blank'>more</a></div>
                    </figcaption>
                </figure>`;
        }
    }

    return [htmlGrid, htmlCarousel, imgCount];
    //return html;
};

const getImages = function(event, qry, page, refreshCache, tnsource, layout) {

    if (!els['q'].value) {
        els['q'].className = 'reqd';
        els['q'].placeholder = 'a search term is required';
        els['q'].focus();
        return;
    }
    else {
        els['q'].className = 'normal';
        els['throbber'].className = 'on';
    }
    
    // we attach qStr1 to 'prev' and 'next' links 
    // with the correctly decremented or  
    // incremented page number
    let qStr1 = 'q=' + qry;
    console.log(`qStr1: ${qStr1}`);
    console.log(`refreshCache: ${refreshCache}`);
    if (refreshCache) {
        qStr1 = qStr1 + '&refreshCache=' + refreshCache;
    }
    console.log(`qStr1: ${qStr1}`);

    qStr1 = qStr1 + '&page=';

    // qStr2 is used for `history`
    let qStr2 = qStr1 + page;
    let qStr3 = qStr2;

    if (tnsource) {
        if (tnsource !== 'zenodo') {
            qStr3 = qStr3 + '&tnsource=' + tnsource;
        }
    }
    
    if (!layout) {
        layout = defaultLayout;
    }

    if (layout !== 'masonry') {
        qStr3 = qStr3 + '&layout=' + layout;
    }

    // the complete url to the api
    let url = baseUrl + qStr2;
    console.log(`url: ${url}`);
    let x = new XMLHttpRequest();

    x.onload = function(event) {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var data = JSON.parse(x.responseText);
                if (data.total) {
                    const [htmlGrid, htmlCarousel, imgCount] = makeLayout(data.result);
                    //const html = makeLayout(data.imagesOfRecords);
                    //els['grid'].innerHTML = html;
                
                    els['numOfFoundRecords'].innerHTML = `${data.total} records found`;
                    els['numOfFoundRecords'].className = 'on';
                    els[layout].innerHTML = htmlGrid;
                    // els['carousel'].innerHTML = htmlCarousel;
                    htmlCarouselStr = htmlCarousel;

                    if (imgCount >= 30) {
                        els['prev'].href = (page === 1) ? '?' + qStr1 + 1 : '?' + qStr1 + (page - 1);
                        els['next'].href = '?' + qStr1 + (parseInt(page) + 1);
                        els['pager'].className = 'on';
                        els['prev'].addEventListener('click', getImagesFromPager);
                        els['next'].addEventListener('click', getImagesFromPager);
                    }

                    els['throbber'].className = 'off';
                    els['footer'].className = 'relative';

                    const figs = document.querySelectorAll('figcaption > a');
                
                    let i = 0;
                    let j = figs.length;
                    for (; i < j; i++) {
                        figs[i].addEventListener('click', toggleFigcaption);
                    }

                    history.pushState('', '', '?' + qStr3);
                }
                else {
                    els['numOfFoundRecords'].innerHTML = 'no records found';
                    els['numOfFoundRecords'].className = 'on';
                    els['throbber'].className = 'off';
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

    if (event !== null) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    return false;
};

const toggleFigcaption = function() {
    if (figcaptions.length == 0) {
        figcaptions = document.querySelectorAll('figcaption');
        fclength = figcaptions.length;
    }

    let fc = this.parentElement.style.maxHeight;
    
    if (fc === fch || fc === '') {
        let i = 0;
        for (; i < fclength; i++) {
            figcaptions[i].style.maxHeight = fch;
        }

        this.parentElement.style.maxHeight =  '100%';
    }
    else {
        this.parentElement.style.maxHeight =  fch;
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

window.onload = function() {
    new autoComplete({
        selector: q,
        minChars: 3,
        source: function(term, suggest) {

            term = term.toLowerCase();
            let matches = [];
            let j = family.length;

            for (let i = 0; i < j; i++) {
                if (~family[i].toLowerCase().indexOf(term)) {
                    matches.push(family[i]);
                }
            }

            els['q'].className = 'normal';
            suggest(matches);
        }
    });

    // When the page is loaded for the first time, 
    // the cacheMsgCheck checkbox should be unchecked
    els['cacheMsgCheck'].checked = false;

    els['cacheMsgCheck'].addEventListener('click', function() {
        if (els['cacheMsg'].className === 'on') {
            els['cacheMsg'].className = 'off';
            els['qWrapper'].style.backgroundColor = '#6b9dc8';
        }
        else {
            els['cacheMsg'].className = 'on';
            els['qWrapper'].style.backgroundColor = '#e54040';
        }
    });
    
    aboutLink.addEventListener('click', function(event) {
        console.log('hello')
        if (els['about'].className === 'off') {
            els['wrapper'].className = 'off';
            els['about'].className = 'on';
        }
        else if (els['about'].className === 'on') {
            els['about'].className = 'off';
            els['wrapper'].className = 'on';
        }
    
        event.preventDefault();
        event.stopPropagation();
    });
    
    els['closeAbout'].addEventListener('click', function(event) {
        els['about'].className = 'off';
        els['wrapper'].className = 'on';
    });
    
    els['btnImages'].addEventListener('click', getImagesFromButton);
    els['btnImages'].addEventListener('submit', getImagesFromButton);

    if (location.search) {
        getQueryParamsAndImages(null, location.search);
    }
    else {
        els['q'].focus();
    }
}