'use strict';

let OCELLUS = (function () {

    let zenodeo;

    // the form and form button
    let ssForm;
    let ssGo;

    let qField;

    // elements on the page
    let footer;
    let wrapper;
    let about;
    let aboutLink;
    let aboutClose;

    // we use these state variables when toggling about
    let wrapperState;
    let footerState;

    let urlFlagSelector;
    let communitiesSelector;
    let communityCheckBoxes;

    const toggleAbout = function(event) {

        about.classList.toggle('show');
        
        // adjust wrapper and footer
        if (about.classList.contains('show')) {

            // save wrapper and footer state
            wrapperState = wrapper.className;
            footerState = footer.className;

            wrapper.classList.toggle('show');
            footer.classList.toggle('relative');

            
        }
        else {

            // restore wrapper and footer
            footer.className = footerState;
            wrapper.className = wrapperState;
        }

    };

    const urlFlags = function (element) {

        if (element.name === 'community') {

            if (element.value === 'all communities') {

                let i = 0;
                let j = communityCheckBoxes.length;

                // if 'all communities' is on then all checkboxes should be checked
                if (element.checked === true) {
                    for (; i < j; i++) {
                        communityCheckBoxes[i].checked = true;
                    }
                }

                // if 'all communities' is off then the default community 
                // (BLR) should be checked
                else {
                    communityCheckBoxes.forEach(el => {
                        el.checked = el.value === 'BLR' ? true : false;
                    })
                }

            }
            else {

                // uncheck 'all communities'
                communityCheckBoxes.forEach(el => {
                    if (el.value === 'all communities') {
                        el.checked = false;
                    }
                })
            }
        }
        else if (element.name === 'resultType') {

            const rtLabels = resultTypeChooser.querySelectorAll('label');
            const rtInputs = resultTypeChooser.querySelectorAll('input');

            for (let i = 0; i < rtLabels.length; i++) {
                if (element.value === rtInputs[i].value) {
                    rtLabels[i].classList.add('searchFocus');
                }
                else {
                    rtLabels[i].classList.remove('searchFocus');
                }
            }
        }
        else if (element.name === 'refreshCache') {
            element.value = element.checked;
        }

    };

    const goGetIt = function(event) {

        /*
        // from button=go
        // from click on resultType IFF q is filled
        const params = {
            event: event,
            q: 'string',
            page: integer,
            size: integer,
            refreshCache: Boolean,
            communities: Array,
            resultType: 'string'
        }

        // from click on link=more in each treatment summary
        const params = {
            event: event,
            treatmentId: 'uuid',
            resultType: 'treatments'
        }

        // from click on link=[taxon hierarchy] in one treatment detail
        const params = {
            event: event,
            kingdom: 'string',
            phylum: 'string',
            order: 'string',
            family: 'string',
            genus: 'string',
            species: 'string',
            resultType: 'treatments'
        }

        // from location.search
        const params = {
            event: null,
            url: location.search
        }
        */

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        
        
            // from button=go
            // or from clicking on 'resultTypeChooser'
            if (qField.value) {

                qField.placeholder = "search for something";
                qField.classList.remove('warning');
                throbber.classList.remove('throbber-off');
                throbber.classList.add('throbber-on');

                OCELLUS.Urlcodec.construct('q', qField.value);
                OCELLUS.Urlcodec.construct('page', 1);
                OCELLUS.Urlcodec.construct('size', 30);
                
                for (let i = 0, j = urlFlagSelector.length; i < j; i++) {
                    const element = urlFlagSelector[i];
                    if (element.name === 'resultType') {
                        if (element.checked === true) {
                            OCELLUS.Urlcodec.construct('resultType', element.value);
                        }
                    }
                    else if (element.name === 'community') {
                        if (element.value !== 'all communities') {
                            if (element.checked === true) {
                                OCELLUS.Urlcodec.construct('community', element.value);
                            }
                        }
                    }
                }


                resources[resultType]()
                
            }
            else {
                qField.placeholder = "c'mon, enter something";
                qField.classList.add('warning');
            }
        }
        else if (location.search) {

        }
    };

    // public stuff hereon
    const init = function(options) {

        // store the options in private variables for later use
        zenodeo = options.zenodeo;

        ssGo = options.ssGo;
        ssForm = options.ssForm;

        qField = options.qField;

        footer = options.footer;
        wrapper = options.wrapper;
       
        about = options.about;
        aboutLink = options.aboutLink;
        aboutClose = options.aboutClose;

        urlFlagSelector = options.urlFlagSelector;
        communitiesSelector = options.communitiesSelector;
        communityCheckBoxes = options.communityCheckBoxes;

        aboutLink.addEventListener('click', toggleAbout);
        aboutClose.addEventListener('click', toggleAbout);

        communitiesSelector.addEventListener('click', function(event){
            communitiesSelector.classList.toggle('open');
        });

        for (let i = 0, j = urlFlagSelector.length; i < j; i++) {

            urlFlagSelector[i].addEventListener('click', function(event) {

                urlFlags(urlFlagSelector[i]);
                
                if (urlFlagSelector[i].name === 'communities') {
                    communitiesSelector.classList.remove('open');
                }
    
            })
        }

        ssGo.addEventListener('click', goGetIt);
        ssForm.addEventListener('submit', goGetIt);

    };

    return {
        init: init
    };
}());