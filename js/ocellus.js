//const loc = 'http://localhost:3030';
const loc = 'http://zenodeo.punkish.org';
const layout = 'grid';
const baseUrl = loc + '/v1/records?size=30&communities=biosyslit&type=image&summary=false&images=true&';
const view = document.getElementById(layout);
const cacheMsg = document.getElementById('cacheMsg');
const qReqdMsg = document.getElementById('qReqdMsg');
const cacheMsgCheck = document.getElementById('cacheMsgCheck');
const q = document.getElementById('q');
const qWrapper = document.getElementById('q-wrapper');
const throbber = document.getElementById('throbber');
const btnImages = document.getElementById('btn-images');
const aboutLink = document.getElementById('aboutLink');
const about = document.getElementById('about');
const closeAbout = document.getElementById('closeAbout');
const pager = document.getElementById('pager');
const wrapper = document.getElementById('wrapper');

const getQueryStr = function(qStr) {
    let qryStr = {};
    qStr.substr(1).split('&').forEach(function(el) {
        qryStr[el.split('=')[0]] = el.split('=')[1];
    });

    return qryStr;
};

const getImagesFromPager = function(event) {
    //toggle('off', 'off', 'off', 'fixed', null);
    smoothScroll(0);

    let qryStr = getQueryStr(this.search);
    let qry = qryStr['q'];
    let page = qryStr['page'];

    getImages(event, qry, page);
};

const getImagesFromButton = function(event) {
    //toggle('off', 'off', 'off', 'fixed', null);

    let qry = q.value.toLowerCase();
    let page = 1;

    getImages(event, qry, page);
};

const makeLayout = function(res) {
    let html = "";

    //const imageresizer = 'http://res.cloudinary.com/ocellus/image/fetch/w_300/';
    //https://api.imageresizer.io/v1/images?key=ba0311d2c817056e2c258f7c2f0b537f034b8412&url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F6%2F65%2FTesla_Model_S_Indoors.jpg
    const imageresizer = 'https://ocellus.imageresizer.io/zenodo/';

    let imgCount = 0;
    let recordCount = 0;
    
    for (let record in res) {
        recordCount = recordCount + 1;
        html += "<figure class='item'>";
        let images = res[record];
        let j = images.length;
        imgCount = imgCount + j;
        for (let i = 0; i < j; i++) {
            //html += `<a href="${images[i]}" target="_blank"><img class="z" src="${images[i]}"></a>`;
            html += `<a href="${images[i]}" target="_blank"><img class="z" src="${imageresizer}${images[i].replace('https://www.zenodo.org/api/files/', '')}"></a>`;
        }

        html += `<figcaption>
            rec ID: <a href='https://zenodo.org/record/${record.split('/').pop()}' target='_blank'>
                ${record.split('/').pop()}</a>
            </figcaption>
        </figure>`;
    }

    return [html, imgCount];
};

//let images;

const showLarge = function(event) {
    large.innerHTML = `<figure class="largeItem">
    ${this.innerHTML}
    </figure>`;
    large.className = 'on';
};

const getImages = function(event, qry, page) {
    if (!q.value) {
        q.className = 'reqd';
        q.placeholder = 'a search term is required';
        q.focus();
        return;
    }
    else {
        throbber.className = 'on';
    }
    
    // we attach qStr1 to 'prev' and 'next' links 
    // with the correctly decremented or  
    // incremented page number
    let qStr1 = 'q=' + qry + '&page=';

    // qStr2 is used for `history`
    let qStr2 = qStr1 + page;

    // the complete url to the api
    let url = baseUrl + qStr2;
    
    let x = new XMLHttpRequest();

    x.onload = function(event) {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var res = JSON.parse(x.responseText);
                const [html, imgCount] = makeLayout(res);
                view.innerHTML = html;

                if (imgCount >= 30) {
                    prev.href = (page === 1) ? '?' + qStr1 + 1 : '?' + qStr1 + (page - 1);
                    next.href = '?' + qStr1 + (parseInt(page) + 1);
                    pager.className = 'on';
                    prev.addEventListener('click', getImagesFromPager);
                    next.addEventListener('click', getImagesFromPager);
                }

                //toggle('off', 'off', 'on', 'relative', null);
                throbber.className = 'off';
                footer.style.position = 'relative';

                //images = document.getElementsByClassName('z');
                // images = document.getElementsByTagName('figure');
                // let j = images.length;
                // for (let i = 0; i < j; i++) {
                //     images[i].addEventListener('click', showLarge);
                // }

                history.pushState('', '', '?' + qStr2);
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

    const speed = Math.round(distance / 100);
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
    cacheMsgCheck.checked = false;
    cacheMsg.className = 'off';
    throbber.className = 'off';
    about.className = 'off';
    pager.className = 'off';

    new autoComplete({
        selector: q,
        minChars: 3,
        source: function(term, suggest){
            term = term.toLowerCase();
            let matches = [];
            let j = family.length;
            for (let i = 0; i < j; i++) {
                if (~family[i].toLowerCase().indexOf(term)) {
                    matches.push(family[i]);
                }
            }
            suggest(matches);
        }
    });

    cacheMsgCheck.addEventListener('click', function() {
        if (cacheMsg.className === 'on') {
            cacheMsg.className = 'off';
            qWrapper.style.backgroundColor = '#6b9dc8';
        }
        else {
            cacheMsg.className = 'on';
            qWrapper.style.backgroundColor = '#e54040';
        }
    });
    
    aboutLink.addEventListener('click', function(event) {
        if (about.className === 'off') {
            wrapper.className = 'off';
            about.className = 'on';
        }
        else if (about.className === 'on') {
            about.className = 'off';
            wrapper.className = 'on';
        }
    
        event.preventDefault();
        event.stopPropagation();
    });
    
    closeAbout.addEventListener('click', function(event) {
        about.className = 'off';
        wrapper.className = 'on';
    });
    
    btnImages.addEventListener('click', getImagesFromButton);

    if (location.search) {
        let qryStr = getQueryStr(location.search);
        let qry = qryStr['q'];
        let page = qryStr['page'];
        q.value = qry;
        getImages(null, qry, page);
    }
    else {
        q.focus();
    }
}
