'use strict';

const ocellus = function() {
    
    // private stuff
    //const loc = 'http://localhost:3030';
    const loc = 'https://zenodeo.punkish.org';
    const baseUrl = loc + '/v1/records?size=30&communities=biosyslit&type=image&summary=false&images=true&';
    const imageresizer = 'https://ocacher.punkish.org/';
    const zenodoApi = 'https://zenodo.org/api/files/';
    const zenodoRecord = 'https://zenodo.org/record/';

    //const layout = 'grid';
    const layout = 'masonry';

    // figcaption settings
    const fch = '30px';
    let figcaptions = [];
    let fclength;

    let els = {};
    ['go', 'numOfFoundRecords','grid', 'masonry', 'qReqdMsg', 'q', 'qWrapper', 'throbber', 'aboutLink', 'about', 'closeAbout', 'prev', 'next', 'pager', 'wrapper', 'html', 'footer'].forEach(function(el) {
        els[el] = document.getElementById(el);
    });

    let facets;
    let where = [];

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
        //els['q'].value = qryStr['q'];
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
    
    const getImages = function(query, page, refreshCache) {
    
        // if (!els['q'].value) {
        //     els['q'].className = 'reqd';
        //     els['q'].placeholder = 'a search term is required';
        //     els['q'].focus();
        //     return;
        // }
        // else {
        //     els['q'].className = 'normal';
        //     els['throbber'].className = 'on';
        // }
        
        // we attach qStr1 to 'prev' and 'next' links 
        // with the correctly decremented or  
        // incremented page number
        // query = JSON.stringify(query).replace(/\{/g, '');
        // query = query.replace(/\}/g, '');
        // query = query.replace(/"/g, '');
        let qStr1 = 'q=' + query;
    
        if (refreshCache) {
            qStr1 = qStr1 + + '&refreshCache=' + refreshCache;
        }
    
        qStr1 = qStr1 + '&page=';
    
        // qStr2 is used for `history`
        let qStr2 = qStr1 + page;
    
        // the complete url to the api
        let url = baseUrl + qStr2;
        //console.log(`url: ${url}`);
        let x = new XMLHttpRequest();
    
        x.onload = function(event) {
            if (x.readyState === 4) {
                if (x.status === 200) {
                    var data = JSON.parse(x.responseText);
                    if (data.total) {
                        const [html, imgCount] = makeLayout(data.result);
                        //const html = makeLayout(data.imagesOfRecords);
                        //els['grid'].innerHTML = html;
                        
                        els['numOfFoundRecords'].innerHTML = `${data.total} records found where ${where.join(' and ')}`;
                        els['numOfFoundRecords'].className = 'on';
                        els[layout].innerHTML = html;
        
                        if (imgCount >= 30) {
                            els['prev'].href = (page === 1) ? '?' + qStr1 + 1 : '?' + qStr1 + (page - 1);
                            els['next'].href = '?' + qStr1 + (parseInt(page) + 1);
                            els['pager'].className = 'on';
                            els['prev'].addEventListener('click', getImagesFromPager);
                            els['next'].addEventListener('click', getImagesFromPager);
                        }
        
                        // els['throbber'].className = 'off';
                        document.querySelector('div.throbber').style.opacity = 0;
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
                        document.querySelector('div.throbber').style.opacity = 0;
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
    
        // if (event !== null) {
        //     event.preventDefault();
        //     event.stopPropagation();
        // }
        
        // return false;
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

    const whereMaker = function(param, vals) {
        let op = 'are';
        if (param === 'title') {
            op = 'contains';
        }
    
        if (Array.isArray(vals)) {
            if (vals.length == 2) {
                return `<i>${param}</i> ${op} <b>"${vals.join('" and "')}"</b>`;
            }
            else if (vals.length > 2) {
                return `<i>${param}</i> ${op} <b>"${vals.slice(0, vals.length - 1).join('", "')}" and "${vals[vals.length - 1]}"</b>`;
            }
        }
        else {
            return `<i>${param}</i> is <b>"${vals}"</b>`;
        }
    };

    const query2qryStr = function(query) {
        let qry = '';
        let title = [];
    
        // sort the query object by its keys so the final qry 
        // is always the same given the same keys, no matter 
        // what order the keys may have been originally
        let params = Object.keys(query);
        params.sort();

        let k = 0;
        let l = params.length;
        for (; k < l; k++) {
            let param = params[k];
            let i = 0;
            let j = facets.length;

            for (; i < j; i++) {
                if (facets[i].key === param) {
                    if (facets[i].actualKey === 'publicationdate') {
                        qry += `+publicationdate:[${query['year']} TO ${(query['year'] * 1) + 1}] `;
                        where.push(`<i>year of publication</i> is between <b>${query['year']} and ${(query['year'] * 1) + 1}</b>`);
                    }
                    else if (facets[i].actualKey === 'title') {
                        if (Array.isArray(query[param])) {
                            title.push.apply(title, query[param]);
                        }
                        else {
                            title.push(query[param]);
                        }
                    }
                    else {
                        if (Array.isArray(query[param])) {
                            qry += `+${facets[i].actualKey}:("${query[param].sort().join('" AND "')}") `;
                            where.push(whereMaker(param, query[param].sort()));
                        }
                        else {
                            qry += `+${facets[i].actualKey}:"${query[param]}" `;
                            where.push(whereMaker(param, query[param]));
                        }
                    }
                }
            }
        }
    
        if (title.length) {
            qry += `+title:("${title.sort().join('" AND "')}")`;
            where.push(whereMaker('title', title));
        }
        
        return encodeURIComponent(qry);
    };

    // public stuff
    return {

        //+creators.name:/Agosti.*/ +publication_date:[1990 TO 1991} +keywords:taxonomy +title:review
        goGetIt: function(query) {

            const qry = query2qryStr(query);

            console.log(qry);
            getImages(
                qry,
                1,      // page
                false   // refreshCache
            );
        },

        init: function(queryFacets) {

            facets = queryFacets;
            // When the page is loaded for the first time, 
            // the cacheMsgCheck checkbox should be unchecked
            //els['cacheMsgCheck'].checked = false;
        
            // els['cacheMsgCheck'].addEventListener('click', function() {
            //     if (els['cacheMsg'].className === 'on') {
            //         els['cacheMsg'].className = 'off';
            //         els['qWrapper'].style.backgroundColor = '#6b9dc8';
            //     }
            //     else {
            //         els['cacheMsg'].className = 'on';
            //         els['qWrapper'].style.backgroundColor = '#e54040';
            //     }
            // });
            
            // aboutLink.addEventListener('click', function(event) {
            //     if (els['about'].className === 'off') {
            //         els['wrapper'].className = 'off';
            //         els['about'].className = 'on';
            //     }
            //     else if (els['about'].className === 'on') {
            //         els['about'].className = 'off';
            //         els['wrapper'].className = 'on';
            //     }
            
            //     event.preventDefault();
            //     event.stopPropagation();
            // });
            
            els['closeAbout'].addEventListener('click', function(event) {
                els['about'].className = 'off';
                els['wrapper'].className = 'on';
            });
        
            if (location.search) {
                getQueryParamsAndImages(null, location.search);
            }
            // else {
            //     els['q'].focus();
            // }
        }
    }
};
