'use strict';

const ocellus = function() {
    
    // private stuff
    let zenodeo = 'https://zenodeo.punkish.org';
    const basePath = '/v1/records?size=30&communities=biosyslit&type=image&summary=false&images=true&';
    let baseUrl = zenodeo + basePath;
    const zenodoApi = 'https://zenodo.org/api/files/';
    const zenodoRecord = 'https://zenodo.org/record/';
    
    let layout = 'masonry';

    // figcaption settings
    let figcaptionHeight = '30px';
    let figcaptions = [];
    let figcaptionLength;

    let facets;

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
        
        init: function(options) {

            if (options.zenodeo) {
                baseUrl = options.zenodeo + basePath;
            }

            if (options.layout) {
                layout = options.layout;
            }

            if (options.figcaptionHeight) {
                figcaptionHeight = options.figcaptionHeight;
            }

            if (options.facets) {
                facets = options.facets;
            }

            
        }
    }
};
