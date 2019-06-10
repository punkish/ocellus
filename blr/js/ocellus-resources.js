OCELLUS = (function (my) {

    const treatment = my.treatment = my.treatment || function(event) {
            
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

    };

    const images = my.images = my.images || function() {
            
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
    };

    const treatments = my.treatments = my.treatments || function() {
            
        const qsParams = OCELLUS.deconstruct(location.search);

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
            let data = OCELLUS.data;
            
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

        OCELLUS.x(href1, callback);
        
        return false;
    };

    const citations = my.citations = my.citations || function() {
    };

	return my;
}(OCELLUS || {}));