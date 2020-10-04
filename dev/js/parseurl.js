parseUrl = function(url) {
    this.url = new URL(url);

    this.target = function() {
        return this.url.pathname.split('.')[0].replace(/^(\/dev)?\//, '') || 'index';
    };
    
    this.query = function() {
        return new URLSearchParams(this.url.search);
    };

    this.hash = function() {
        const hash = new URLSearchParams(this.url.hash.replace(/^#/, ''));

        // default values to be returned
        const h = { layout: 'compact', search: 'simple' };

        for (let k in h) {
            if (hash.has(k)) {
                h[k] = hash.get(k)
            }
        }

        return h;
    }
}

const u = new parseUrl('https://foo.com/?comm=a&comm=b&p=1&s=30#foobart=compact&search=fancy');

const target = u.target();
const query = u.query();
const hash = u.hash();

console.log(`target: ${target}`);
console.log('comm: ' + query.getAll('comm').join(', '));
console.log('layout: ' + hash.layout);
console.log('search: ' + hash.search);

