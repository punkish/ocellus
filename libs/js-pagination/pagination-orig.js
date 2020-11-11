/* Constants */
RESULTS_PER_PAGE = 10;

SEARCH_RESULTS = 'searchResults' // ID of element to display search results
PAGINATE = 'paginate' // ID of element to display pagination results



/**
 * pagination()
 *
 * Returns an array of page numbers between one (1) and a given end number,
 * returning a maximum of 10 numbers, with missing ranges replaced with elipses
 * (which are included in the maximum return count). A 'current page' is
 * supplied, and the current page number is surrounded by the two sequential
 * numbers before and after.
 *
 * The total number of numbers to return is determined by the total number
 * of results to expect divided by the number of results to display per page.
 * This is further affected by the current page displayed. Possible outcomes of
 * the function could look like so:
 *
 * [1, 2, 3, 4, 5, 6, 7, '...', 44, 45]        // 1-7 is the current page
 * [1, 2, 3, '...', 7, 8, 9, 10, 11, 12]       // 2 is the current page
 * [1, 2, '...', 10, 11, 12, '...', 44, 45]    // 8-39 is the current page
 * [1, 2, '...', 33, 34, 35, 36, 37, 38, 39]   // 33-39 is the current page
 *
 * @param {number} total_results (Required: The total number of results to
 *    expect, the end number.)
 *
 * @param {number} start_number (Required: The value/start number of the page 
 *    currently displayed.)
 *
 * @param {number} results_page (Optional: The number of results to show for
 *    each page. Defaults to 10.)
 *
 * @return {array} (An array containing the range numbers.)
 *
 * @throws {TypeError} (If any parameter is not a finite number.)
 * @throws {Error} (If any parameter is not a positive number.)
 *
 * modified from: https://www.freecodecamp.org/news/https-medium-com-gladchinda-hacks-for-creating-javascript-arrays-a1b80cb372b/
 * author: Ammon Shepherd
 * date: August 12, 2019
 */

function pagination(total_results, start_number, results_page = 10) {
    // Test that the first 3 arguments are finite numbers.
    // Using Array.prototype.every() and Number.isFinite().
    const allNumbers = [total_results, results_page, start_number].every(Number.isFinite);

    // Throw an error if any of the first 3 arguments is not a finite number.
    if (!allNumbers) {
        throw new TypeError('pagination() expects only finite numbers as arguments.');
    }

    // Ensure the step is always a positive number.
    if (total_results <= 0) {
        throw new Error('total_results must be a number greater than 0.');
    }
    if (results_page <= 0) {
        throw new Error('results_page must be a number greater than 0.');
    }
    if (start_number < 0) {
        throw new Error('start_number must be a number greater than or equal to 0.');
    }

    // Determine the length of the array to be returned, which is the total
    // results divided by the number of results per page.
    const length = Math.ceil(Math.abs(total_results / results_page));

    // 10 pages or less, just return the array
    if (length <= 10 ) {
        // Fill up a new array with the range numbers
        // using Array.from() with a mapping function.
        let full_array = Array.from(Array(length), (x, index) => index + 1);
        return full_array
    }
  
    let current_page = (start_number / results_page) + 1;
    if (start_number == 1){
        current_page = 1;
    }

    let pages = new Array();
    for (i = 1; i <= length; i++) {
        // If the current page is 7 or less, show pages 1-7, then ellipses, then
        // the last two pages
        if ( (current_page < 7 ) && (i < 7) ) {
            pages.push(i);
            continue;
        }

        if ( (i == 8) && (current_page < 6) ) {
            pages.push('...');
            continue;
        }


        // if the current page is within six places of the last page, show the
        // last six pages.
        if ( (current_page > length - 5) && (i > length - 5) ) {
            pages.push(i);
            continue;
        }

        if ( (i == length - 6) && (current_page > length - 4) ) {
            pages.push('...');
            continue;
        }


        // Show the first two pages, the current page surrounded by a page and
        // ellispses, then the last two pages
        if (i < 3) {
            pages.push(i);
        } else if (i == current_page - 1) {
            pages.push('...');
            pages.push(i);
        } else if (i == current_page) {
            pages.push(i);
            continue;
        } else if ( (i == current_page + 1) && (current_page < length - 3) ) {
            pages.push(i);
            pages.push('...');
        }

        if ( (i == length - 1) || (i == length) ) {
            pages.push(i);
        }

    }

    return pages;
}

/**
 * buildPagination()
 *
 * Generates and inserts the pagination links into the HTML document. This
 * function should be called when the page is loaded. The function takes the
 * total number of results returned from the search query.
 *
 * @param {number} results_total (Required: The total number of results
 *    returned from the search query.)
 *
 * @throws {Error} (If any parameter is not a positive number.)
 *
 * author: Ammon Shepherd
 * date: August 22, 2019
 */

function buildPagination(results_total) {
    // Ensure the step is always a positive number.
    if (results_total <= 0) {
        throw new Error('total_results must be a number greater than 0.');
    }

    const url = new URL(window.location.origin + window.location.pathname);
    let searchParams = new URLSearchParams(window.location.search);
    var params = (new URL(document.location)).searchParams;
    var current_start = parseInt(params.get('start')); // value of start parameter
    // if the URL parameter 'start' is empty, change it to 0, the first page 
    if (!current_start) {
        current_start = 0;
    }
    // the start param returns the results to start on, to convert to the
    // current page number, divide by results per page and add 1.
    var cp = (current_start / RESULTS_PER_PAGE) + 1; // current page number

    // If there are no results, just return some text saying that.
    if (results_total < 1) {
        const result = document.getElementById(SEARCH_RESULTS);
        result.insertAdjacentHTML('afterbegin', '<h2>No results found.</h2>');
        return;
    }

    // Generate an array of page numbers, using the pagination function
    let pages_list = pagination(results_total, current_start, RESULTS_PER_PAGE);

    const paginate = document.getElementById(PAGINATE); 

    // loop through the array of pages, and construct a link for each page
    // number. The current page number does not become a link. Also create the
    // previous and next links.
    for (n = 0; n < pages_list.length; n++) {
        var page_num = pages_list[n]; // the page number from the array

        // if the page number is actually an elipse, just return an elipse
        // without a link
        if (page_num == "...") {
            paginate.insertAdjacentHTML('beforeend', `<span class="page-link">${page_num}</span>`);

        } else {
            // start = where the search results should start. 
            // This is the page number (in the array), minus one (1), times the
            // number of results per page
            var start = (page_num - 1) * RESULTS_PER_PAGE; 

            
            // if the page number in the array that we are on is the same as
            // the current page (calculated from the start parameter) then this
            // is the current page, 
            if (page_num == cp) {

                // Show the previous link if the current page is greater than 5
                if (cp > 5) {
                    // the start value should be the results per page quantity
                    // less than the current start value
                    params.set('start', start - RESULTS_PER_PAGE);
                    paginate.insertAdjacentHTML('afterbegin', `<span class="page-link"><a href='${url.toString()}?${params.toString()}'>&#9756;</a></span>`)
                }

                // Show the next link if the current page is 5 places less than
                // the last one (which you get by getting the value of the last
                // element in the pages_list array) then subtract 5
                if (cp < pages_list[pages_list.length - 1] - 4 ) {
                    // if the current page is 1, then start should be 0
                    if (cp == 1){
                        start = 0;
                    }
                    params.set('start', start + RESULTS_PER_PAGE);
                    paginate.insertAdjacentHTML('afterend', `<div class="page-link next-link"><a href='${url}?${params.toString()}'>&#9758;</a></div>`)
                }

                // Show the current page number, without a link, then skip the
                // rest of the code in the loop and go to the next element in
                // the array
                paginate.insertAdjacentHTML('beforeend', `<span class="page-link current-page-link btn-floating btn-large">${page_num}</span>`);
                continue;
            }

            // display the rest of the links
            params.set('start', start);
            paginate.insertAdjacentHTML('beforeend', `<span class="page-link"><a href='${url}?${params.toString()}'>${page_num}</a></span>`);
        }


    }

}



