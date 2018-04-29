'use strict';

const ocellus = function() {
    
    // private stuff
    const debug = true;
    const loc = 'http://localhost:3030';
    //const loc = 'https://zenodeo.punkish.org';
    const baseUrl = loc + '/v1/records?size=30&communities=biosyslit&type=image&summary=false&images=true&';
    const imageresizer = 'https://ocacher.punkish.org/';
    const zenodoApi = 'https://zenodo.org/api/files/';
    const zenodoRecord = 'https://zenodo.org/record/';
    const sandbox = "https://sandbox.zenodo.org/api/iiif/v2/<bucket>:<version>:zt00109-2.png/full/250,/0/default.jpg";

    //5104ebe3-1591-4a1f-bbf3-c9b25f648391/figure

    //const layout = 'grid';
    const layout = 'masonry';

    // figcaption settings
    const fch = '30px';
    let figcaptions = [];
    let fclength;

    // selectors for webpage elements 
    let els = {};
    ['go', 'cacheMsgCheck', 'messages', 'numOfFoundRecords','grid', 'masonry', 'qReqdMsg', 'q', 'qWrapper', 'throbber', 'aboutLink', 'about', 'closeAbout', 'prev', 'next', 'pager', 'wrapper', 'html', 'footer'].forEach(function(el) {
        els[el] = document.getElementById(el);
    });

    // we store a private instance of the user-supplied facets
    let facets;

    // help build the "where" string
    let where = [];

    const log = function(msg) {
        if (debug) {
            console.log(msg);
            console.trace();   
        }
    };

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
                        <div class="transition-050 desc">${title}. <a href="${zenodoRecord}${recId}" target="_blank">more</a></div>
                    </figcaption>
                </figure>`;
        }
    
        return [html, imgCount];
        //return html;
    };
    
    const literateNumbers = function(num) {
        const litnum = {
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

        if (num < 11) {
            return litnum[num];
        }
        else {
            return num;
        }
    };

    const getImages = function(query, page, refreshCache, button) {
    
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
        log(`url: ${url}`);

        let x = new XMLHttpRequest();
    
        x.onload = function(event) {
            if (x.readyState === 4) {
                if (x.status === 200) {
                    var data = JSON.parse(x.responseText);
                    if (data.total) {
                        const [html, imgCount] = makeLayout(data.result);
                        //const html = makeLayout(data.imagesOfRecords);
                        //els['grid'].innerHTML = html;
                        
                        els['numOfFoundRecords'].innerHTML = `${literateNumbers(data.total)} records found where ${where.join(' and ')}`;
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

                    button.disabled = false;
                    button.className = 'fs-button-primary';
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

    /**
     * 
     * @param {string} param
     * @param {array} vals 
     */
    const whereMaker = function(param, vals) {
        let op = 'are';
        if (param === 'title') {
            op = 'contains';
        }
    
        if (Array.isArray(vals)) {
            if (vals.length == 2) {
                return `<i>${param}</i> ${op} <b>${vals.join('</b> and <b>')}</b>`;
            }
            else if (vals.length > 2) {
                return `<i>${param}</i> ${op} <b>${vals.slice(0, vals.length - 1).join('; ')}</b> and <b>${vals[vals.length - 1]}</b>`;
            }
        }
        else {
            return `<i>${param}</i> is <b>${vals}</b>`;
        }
    };

    /**
     * Notes on constructing a query —
     *
     * A couple of issues to remember:
     * 1) “q” cannot be repeated (i.e. it’s ?q=…… and not ?q=…&q=…)
     * 2) “publication_date" is a full date, hence “publication_date:1990” 
     * is translated into “publicalication_date:1990-01-01” 
     * (thus you query for a specific date, and not a full year). 
     * 
     * With that in mind, let’s construct a query to find all the records 
     * by creator whose name starts with “Agos”, was published in 1990, 
     * has the keyword “taxonomy” and the word “review” in its title.
     *  
     * 1) Author name starts with Agosti
     * 
     * creators.name:/Agosti.*\/  —> starting with Agosti (note you have to 
     * read Elaticsearch’s regular expression syntax, because it is not 
     * completely matching other common syntaxes). For one, regular 
     * expressions always match the entire string, so anchoring to the 
     * beginning of a string with “^” does not exist. (See https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html#regexp-syntax)
     * 
     * Related examples
     * 
     * creators.name:Agosti (no need for regular expressions as ES already 
     * tokenizes the name into individual components)
     * 
     * creators.name:"Agosti, Donat" —> (exact phrase, solves your comma problem)
     * creators.name:(Agosti Donat)  —> (Agosti OR Donat)
     * creators.name:(Agosti AND Donat)  —> (Agosti AND Donat)
     * 
     * 2) Published in 1990
     * 
     * Publication date is a full date, so you need a range query.
     * 
     * pubilcation_date:[1990 TO 1991] —> all uploads with published 
     * from 1990-01-01 to 1991-01-01, both dates included
     * 
     * pubilcation_date:[1990 TO 1991} —> all uploads with published 
     * from 1990-01-01 to 1991-01-01, first date included, last date excluded
     * 
     * pubilcation_date:[1990-01-01 TO 1990-12-31]
     * 
     * 3) Keyword taxonomy
     * 
     * Keywords are special because you can either search for them in the query 
     * or use filters. Let’s take the query first:
     * 
     * keywords:taxonomy
     * 
     * If you use it as a filter you add it to the URL
     * 
     * ?q=….&keywords=taxonomy&keywords=animalia —> (taxonomy OR animalia)
     * 
     * 4) Word “review” in title
     * 
     * title:review
     * 
     * Putting it together:
     * 
     * creators.name:/Agosti.*\/ pubilcation_date:[1990 TO 1991} keywords:taxonomy title:review
     * 
     * This translates into A or B or C or D, and what you want is A and B and C and D. 
     * Hence we need to add pluses (to require each condition to be met):
     * 
     * +creators.name:/Agosti.*\/ +publication_date:[1990 TO 1991} +keywords:taxonomy +title:review
     * 
     * Finally, you need to URL encode above query:
     * 
     * ?q=%2Bcreators.name%3A%2FAgosti.%2A%2F%20%2Bpublication_date%3A%5B1990%20TO%201991%7D%20%2Bkeywords%3Ataxonomy%20%2Btitle%3Areview
     *
     */
    const query2qryStr = function(query) {
        let qry = '';
        let title = [];
        let freetext = [];
    
        /*
         * sort the query object by its keys so the final qry 
         * is always the same given the same keys, no matter 
         * what order the keys may have been originally
         */
        let params = Object.keys(query);
        params.sort();

        let k = 0;
        let l = params.length;
        for (; k < l; k++) {
            let param = params[k];
            log(`param: ${param}`);

            if (param === 'q') {
                if (Array.isArray(query['q'])) {
                    freetext.push.apply(freetext, query['q']);
                }
                else {
                    freetext.push(query['q']);
                }
            }
            else {
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
        }
    
        if (title.length) {
            qry += `+title:("${title.sort().join('" AND "')}")`;
            where.push(whereMaker('title', title));
        }

        if (freetext.length) {
            qry += `${freetext.sort().join(' ')}`;
            where.push(whereMaker('free text', freetext));
        }
        
        return encodeURIComponent(qry);
    };

    // public stuff
    return {

        //+creators.name:/Agosti.*/ +publication_date:[1990 TO 1991} +keywords:taxonomy +title:review
        goGetIt: function(query, button) {

            const qry = query2qryStr(query);

            log(`qry: ${qry}`);
            log(`decodedURI qry: ${decodeURIComponent(qry)}`);
            getImages(
                qry,
                1,      // page
                false,   // refreshCache
                button
            );
        },

        init: function(queryFacets) {

            facets = queryFacets;
            // When the page is loaded for the first time, 
            // the cacheMsgCheck checkbox should be unchecked
            els['cacheMsgCheck'].checked = false;
        
            els['cacheMsgCheck'].addEventListener('click', function() {
                if (els['messages'].className === 'msg on') {
                    els['cacheMsg'].className = 'off';
                    //els['qWrapper'].style.backgroundColor = '#6b9dc8';
                }
                else {
                    els['cacheMsg'].className = 'msg on';
                    els['messages'].innerHTML = 'This will query BLR and overwrite any cached results. You probably <em><b>do not</b></em> want this.';
                    //els['qWrapper'].style.backgroundColor = '#e54040';
                }
            });
            
            aboutLink.addEventListener('click', function(event) {
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
        
            if (location.search) {
                getQueryParamsAndImages(null, location.search);
            }
            // else {
            //     els['q'].focus();
            // }
        }
    }
};
