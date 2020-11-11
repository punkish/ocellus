# JS pagination

Just a little method that helps create pagination links for a website.

There are two functions, pagination() and buildPagination().

pagination() eturns an array of page numbers between one (1) and a given end number,
returning a maximum of 10 numbers, with missing ranges replaced with elipses
(which are included in the maximum return count). A 'current page' is supplied,
and the current page number is surrounded by the two sequential numbers before
and after.

The number of numbers to return is determined by the total number of
results to expect divided by the number of results to display per page.  This
is further affected by the current page displayed. Possible outcomes of the
function could look like so:

```
[1, 2, 3, 4, 5, 6, 7, '...', 44, 45]        // 1-7 is the current page
[1, 2, 3, '...', 7, 8, 9, 10, 11, 12]       // 2 is the current page
[1, 2, '...', 10, 11, 12, '...', 44, 45]    // 8-39 is the current page
[1, 2, '...', 33, 34, 35, 36, 37, 38, 39]   // 33-39 is the current page

```

The function takes three parameters:

- total_results (Required: The total number of results to expect, the end number.)
- start_number (Required: The value/start number of the page currently displayed.)
- results_page (Optional: The number of results to show for each page. Defaults to 10.)

The function returns an array containing the range numbers that can be turned
into links..

This code is modified from this [FreeCodeCamp article](https://www.freecodecamp.org/news/https-medium-com-gladchinda-hacks-for-creating-javascript-arrays-a1b80cb372b/). 


buildPagination() takes in a number (the total number of results returned from
what ever search query you ran), and builds the HTML for the page numbers and
links using the pagination() function.


# Usage

To use these functions, call the buildPagination() function on page load, and
put a script tag in the HTML page where it should be used.  It should go at the
bottom of the HTML page. In the code below, "200" is where you can put the
total number of results returned from the search query.

  ```
  <html>
  <head>
  <head>
  <body onload="buildPagination(200);">
  ...
  <script src="pagination.js" type="text/javascript"></script>
  </body>
  </html>
  ```

You can change three variables in the pagination.js file (located at the top of
the file):
- RESULTS_PER_PAGE = how many results per page you want to show. The default is
  ten.
- SEARCH_RESULTS = the ID of the HTML element to use for displaying the
  search results. This is only used to display text when zero is passed to
  the buildPagination() function. You should probably have something in place
  to deal with zero results from a search query before you use this function.
- PAGINATE = the ID of the HTML element to use for displaying the
  pagination HTML. 


# Demo

A working example is included with these files. The easiest way to see it
is to download all of these files into a folder on your computer and then pull
up the index.html file in a browser.
