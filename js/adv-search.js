import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { toggleDateSelector } from './listeners.js';

const init = () => {

    const biomeAc = new autoComplete({
        selector: $('input[name="as-biome"]'),
    
        //
        // 
        // 'term' refers to the value currently in the text input.
        // 'response' callback, which expects a single argument: the data 
        //      to suggest to the user. This data must be an array of 
        //      filtered suggestions based on the provided term:
        //      ['suggestion 1', 'suggestion 2', 'suggestion 3', ...]
        // 
        //
        source: async function(term, suggest) {
            const response = await fetch(`${globals.server}/biomes?biome=${term}*`);
    
            if (!response.ok) {
                throw Error("HTTP-Error: " + response.status)
            }
    
            const json = await response.json();
            const matches = [];
    
            if (json.item.result.records) {
                json.item.result.records.forEach(r => matches.push(r.biome_synonym));
            }
            else {
                matches.push('nothing found… please try again');
            }
    
            //
            // We narrow the matches array as the user types in the input 
            // field. This makes the dropdown box focus on only the 
            // matching terms
            //
            if (matches.length) {
                const suggestions = [];
    
                for (let i=0; i<matches.length; i++) {
                    if (~matches[i].toLowerCase().indexOf(term)) {
                        suggestions.push(matches[i]);
                    }
                }
    
                suggest(suggestions);
            }
        },
    
        minChars: 3,
        delay: 150
    });
    
}

// const authorityAc = new autoComplete({
//     selector: document.querySelector('input[name=authorityName]'),

//     //
//     // 
//     // 'term' refers to the value currently in the text input.
//     // 'response' callback, which expects a single argument: the data 
//     //      to suggest to the user. This data must be an array of 
//     //      filtered suggestions based on the provided term:
//     //      ['suggestion 1', 'suggestion 2', 'suggestion 3', ...]
//     // 
//     //
//     source: async function(term, suggest) {
        

//         const response = await fetch(`http://localhost:3010/v3/treatmentauthors?treatmentAuthor=${term}*`);

//         if (!response.ok) {
//             throw Error("HTTP-Error: " + response.status)
//         }

       
//         const json = await response.json();
//         const matches = [];

//         if (json.item.result.records) {
//             json.item.result.records.forEach(r => matches.push(r.treatmentAuthor));
//         }
//         else {
//             matches.push('nothing found… please try again');
//         }

//         //
//         // We narrow the matches array as the user types in the input 
//         // field. This makes the dropdown box focus on only the 
//         // matching terms
//         //
//         if (matches.length) {
//             const suggestions = [];

//             for (let i=0; i<matches.length; i++) {
//                 if (~matches[i].toLowerCase().indexOf(term)) {
//                     suggestions.push(matches[i]);
//                 }
//             }

//             suggest(suggestions);
//         }
//     },

//     minChars: 3,
//     delay: 150
// });

export { init }