'use strict';

// my desired pseudo-object with incorrect code
const obj = {
    // a: {
    //     cached_recs: 0,
    //     get recs() {
    //         if (this.cached_recs == 0) {
    //             getRecs('a', obj);
    //         }
    //         else {
    //             this.cached_recs;
    //         }
    //     }
    // },
    // b: {
    //     cached_recs: 0,
    //     get recs() {
    //         if (this.cached_recs == 0) {
    //             getRecs('b', obj);
    //         }
    //         else {
    //             this.cached_recs;
    //         }
    //     }
    // },
    c: {
        cached_recs: 0,
        get recs() {
            if (this.cached_recs == 0) {
                this.cached_recs = getRecs('c', obj);
            }

            return this.cached_recs;
        }
    }
};


const getRecs = async function(s, o) {
    
    o[s].cached_recs =  await setTimeout(function() { 
        console.log(`calcing ${s}...`);
        return Math.ceil(Math.random() * 100);
    }, 5000);
};

// console.log('1: ' + obj.a.recs);
// console.log('2: ' + obj.a.recs);
// console.log('3: ' + obj.b.recs);
console.log('4: ' + obj.c.recs);
// console.log('5: ' + obj.b.recs);
console.log('6: ' + obj.c.recs);