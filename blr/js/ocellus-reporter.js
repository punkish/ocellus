OCELLUS.reporter = (function (my) {

    const cancelReporter = function(event) {

        const c = event.target;
        const f = c.parentElement;
        const r = f.parentElement.querySelector('.report');

        // show widget
        f.style.visibility = 'hidden';

        // hide report button
        r.style.visibility = 'visible';

        event.preventDefault();
        event.stopPropagation();
    };

    const submitReporter = function(event) {

        const send = event.target;
        const form = send.parentElement;
        const widget = form.parentElement;
        const report = widget.querySelector('.report');
        const reporter = form.querySelector('.imageReport');
        const recId = form.querySelector('input[name="recId"]').value;
        const status = widget.querySelector('.status');

        // Send a POST request to /repos/:owner/:repo/issues with JSON
        const github = 'https://api.github.com/repos/plazi/Biodiversity-Literature-Repository/issues';

        const payload = JSON.stringify({
            "title": `problem with record id: ${recId}`,
            "body": reporter.innerText,
            "assignee": "myrmoteras",
            "milestone": 1,
            "labels": [
                "images"
            ]
        });

        const method = 'POST';
        const url = github;
        const callback = function() {

                // show widget
                form.style.visibility = 'hidden';
                status.innerHTML = 'Thank you for submitting the report!';
                status.style.visibility = 'visible';
                status.style.display = 'block';

                setInterval(function() {
                    status.style.visibility = 'hidden';
                    status.style.display = 'none';
                    report.style.visibility = 'visible';
                }, 3000);
        };

        const headers = [
            {k: "Content-type", v: "application/json"},
            {k: "Authorization", v: "Basic " + btoa("blruser:xucqE5-tezmab-ruqgyr")}
        ]

        x(method, url, callback, headers, payload);

        event.preventDefault();
        event.stopPropagation();
    };

    const toggleReporter = function(event) {

        const r = event.target;
        const f = r.parentElement.querySelector('form');

        // show widget
        f.style.visibility = 'visible';

        // hide report button
        r.style.visibility = 'hidden';

        event.preventDefault();
        event.stopPropagation();
    };
	// add capabilities...

	return my;
}(OCELLUS || {}));