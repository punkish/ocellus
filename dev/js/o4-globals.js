if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};
if (typeof(O.globals) === 'undefined' || typeof(O.globals) !== 'object') O.globals = {};

O.globals.zenodoUri   = 'https://zenodo.org/record';

/*
* resource are what are fetched from remote and displayed
* pseudoresources are modals that are already embeddeded 
* in index.html and are shown or hidden on demand
*/
O.globals.resources       = ['treatments', 'citations', 'images'];
O.globals.pseudoResources = ['about', 'ip', 'contact', 'privacy'];

// the following are the valid query params
O.globals.validQueryParams = ['communities', 'page', 'size', 'q', 'doi', 'author', 'text'];

// valid params for zenodeo uri
O.globals.zenodeoUriParams = {
    images: [ 'q', 'size', 'page', 'communities', 'refreshCache' ],
    treatments: [ 'q', 'size', 'page', 'refreshCache' ],
    citations: [ 'q', 'size', 'page', 'refreshCache' ]
};

// valid params for browser uri
O.globals.browserUriParams = {
    images: [ 'q', 'size', 'page', 'communities' ],
    treatments: [ 'q', 'size', 'page' ],
    citations: [ 'q', 'size', 'page' ]
};

/*
    * the following input params are ignored while creating the 
    * textual version of the search criteria
    * */
O.globals.notInSearchCriteria = [
    'resource', 
    'communities', 
    'communitiesChooser',
    'refreshCache', 
    'size', 
    'page',
    'reset',
    'submit'
];

O.globals.closedFigcaptionHeight = '30px';
O.globals.pageSize = 30;