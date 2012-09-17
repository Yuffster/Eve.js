var casper = require('casper').create();

var url = require('fs').workingDirectory+"/run_tests.html";

casper.start(url);

casper.then(function() {
	casper.waitFor(function(){
	    return this.evaluate(function() {
			return window.Eve_results;
	    });
	}, function(){
		this.test.assertEval(function() {
	        return window.Eve_results.failures == 0;
	    }, 'No failures logged in qUnit');
	}, function() {
		console.log('Test timeout.');
	}, 10000);	
});

casper.run(function() {

	this.test.renderResults(true, this.test.testResults.failed ? 1 : 0);
    this.test.done();

});