//const loc = 'http://localhost:3030';
const loc = 'https://zenodeo.punkish.org';
const baseUrl = loc + '/v1/records?size=30&communities=biosyslit&type=image&summary=false&images=true&';
const imageresizer = 'https://ocacher.punkish.org/';
const zenodoApi = 'https://zenodo.org/api/files/';
const zenodoRecord = 'https://zenodo.org/record/';

//const layout = 'grid';
const layout = 'masonry';
const fch = '30px';
let figcaptions = [];
let fclength;

let els = {};
["numOfFoundRecords","grid","masonry","cacheMsg","qReqdMsg","cacheMsgCheck","q","qWrapper","throbber","btnImages","aboutLink","about","closeAbout","prev","next","pager","wrapper","html","footer"].forEach(function(el) {
    els[el] = document.getElementById(el);
});

const getQueryStr = function(qStr) {
    let qryStr = {};
    qStr.substr(1)
        .split('&')
        .forEach(function(el) {
            qryStr[el.split('=')[0]] = el.split('=')[1];
        });

    return qryStr;
};

const getQueryParamsAndImages = function(event, search) {
    const qryStr = getQueryStr(search);
    els['q'].value = qryStr['q'];
    getImages(
        event, 
        qryStr['q'],            // qry 
        qryStr['page'],         // page, 
        qryStr['refreshCache']  // refreshCache
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
        els['cacheMsgCheck'].checked   // refreshCache
    );
};

const makeLayout = function(imagesOfRecords) {
    let html = '';
    let imgCount = 0;
    //let recordCount = 0;
    //const imagesOfRecords = data.imagesOfRecords;

    for (let record in imagesOfRecords) {
        //recordCount = recordCount + 1;

        const images = imagesOfRecords[record]["images"];
        const title = imagesOfRecords[record]["title"];
        const creators = imagesOfRecords[record]["creators"];

        const j = images.length;
        imgCount = imgCount + j;

        html += "<figure class='item'>";

        for (let i = 0; i < j; i++) {
            html += `<a href="${images[i]}" target="_blank"><img class="z" src="${imageresizer}${images[i].replace(zenodoApi, '')}"></a>`;
        }

        const recId = record.split('/').pop();

        html += `<figcaption class="transition-050 opacity85 text">
                    rec ID: <a class="transition-050">${recId}</a>
                    <div class="transition-050 desc">${title}. <a href='${zenodoRecord}${recId}' target='_blank'>more</a></div>
                </figcaption>
            </figure>`;
    }

    return [html, imgCount];
    //return html;
};

const getImages = function(event, qry, page, refreshCache) {

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

    if (refreshCache) {
        qStr1 = qStr1 + + '&refreshCache=' + refreshCache;
    }

    qStr1 = qStr1 + '&page=';

    // qStr2 is used for `history`
    let qStr2 = qStr1 + page;

    // the complete url to the api
    let url = baseUrl + qStr2;
    console.log(`url: ${url}`);
    let x = new XMLHttpRequest();

    x.onload = function(event) {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var data = JSON.parse(x.responseText);
                if (data.total) {
                    const [html, imgCount] = makeLayout(data.result);
                    //const html = makeLayout(data.imagesOfRecords);
                    //els['grid'].innerHTML = html;
                
                    els['numOfFoundRecords'].innerHTML = `${data.total} records found`;
                    els['numOfFoundRecords'].className = 'on';
                    els[layout].innerHTML = html;

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

                    history.pushState('', '', '?' + qStr2);
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