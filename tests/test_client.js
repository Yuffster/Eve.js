(function() {
	
	//We'll grab the frameworks from CDNs.
	var frameworks = {
		mootools  : "http://ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js",
		jquery	  : "http://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js",
		dojo	  : "http://ajax.googleapis.com/ajax/libs/dojo/1.8.0/dojo/dojo.js",
		yui		  : "http://yui.yahooapis.com/3.6.0/build/yui/yui-min.js",
		prototype : "http://ajax.googleapis.com/ajax/libs/prototype/1.7.1.0/prototype.js"
	};
	
	//Grab the query parameters.
	var params = {}, i, d,
	    query  = window.location.search.substring(1);
	    query  = query.split('&');
	for (var i=0;i<query.length;i++) {
		d = query[i].split('=');
		params[d[0]] = d[1];
	}
	
	//Outputs the final results to a pretty list.
	function outputResults(results, tests) {	
		var o, ul, li, passes, total, status, els, finals = {passes:0,total:0};
		els = document.getElementById('framework-select').getElementsByTagName('a');
		for (var i = 0; i<results.length; i++) {
			total  = Number(results[i].split('-')[1]);
			passes = total - Number(results[i].split('-')[0]);
			status = (passes==total) ? 'pass' : 'fail';
			finals.passes = finals.passes+passes;
			finals.total  = finals.total+total;
			o = {
				passes : passes,
			    total  : total,
			    name   : els[i].innerHTML,
			    status : status,
				href   : els[i].href
			}
			ul = document.createElement('ul'),
			ul.appendChild(document.getElementById('status-template').cloneNode(true));
			ul.innerHTML = ul.innerHTML.replace(/\{\{(.+?)\}\}/g, function(rep, key) {
			    return o[key] || rep;
			});
			li = ul.getElementsByTagName('li')[0];
			li.getElementsByTagName('a')[0].href=o.href;
			li.id = '';
			document.getElementById('results').className = (finals.passes==finals.total) ? 'passed' : 'failed';
			document.getElementById('results-list').appendChild(li);
		}
		finals.failures = finals.total - finals.passes;
		window.Eve_results = finals;
	};
	
	//Pull out the previous test history.
	params.results = (params.results) ? params.results.split(';') : [];
	
	var framework = params.runner,
		els = document.getElementById('framework-select').getElementsByTagName('a'),
		tests = [], i;
	
	for (i=0;i<els.length;i++) {
		tests[i] = els[i].getAttribute('href');
		//Display previous test results
		if (!params.results[i]) continue;
		if (params.results[i].match(/^0-/)) {
			els[i].className = 'passed';
		} else {
			els[i].className = 'failed';
		}
	}
	
	//Autorun if someone's just hanging around the index.
	if (!framework&&params.auto&&params.results.length==0) {
		framework   = 'jquery';
		params.auto = true;
	//Display a run test message.
	} else if (!framework&&!params.auto) {
		document.body.className = "tests-pending";
	//Display our final results.
	} else if (params.done) {
		document.body.className = "tests-finished";
		outputResults(params.results,tests);
	}
	
	if (!framework) return;
	
	document.title = "Eve.js Test: "+framework;
	
	document.getElementById('fw-'+framework).className = 'active';
	
	function loadScript(url, callback) {
		var script	 = document.createElement('script');
		script.type	 = "text/javascript";
		script.async = false;
		script.src	 = url;
		if (callback) {
			script.onreadystatechange = function() {
				if (this.readyState == 'complete') callback();
			};
			script.onload = callback;
		}
		document.body.appendChild(script);
	}

	//Load everything in the correct order.
	loadScript(frameworks[framework]);
	loadScript("eve.js");
	loadScript("examples/"+framework+'.js');
	loadScript("http://code.jquery.com/qunit/qunit-1.10.0.js", function() {
		if (!params.auto) return;
		QUnit.done(function(d) {
			params.results.push( ""+d.failed+'-'+d.total );
			var next = ((tests[params.results.length]) || "?done=true") +
				'&results='+params.results.join(';') +
				'&auto=1';
			window.location = next;
		});
	});
	loadScript("tests/tests.js");
	
	var link	 = document.createElement('link');
	link.rel	 = "stylesheet";
	link.href	 = "http://code.jquery.com/qunit/qunit-git.css";
	document.head.appendChild(link);

})();