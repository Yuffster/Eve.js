function wait(con, fun, max) {
	max = max || 5000;
	var waiter = setInterval(function() {
		if(con()) {
			fun();
			clearInterval(waiter);
		}
	}, 100);
	setTimeout(function() {
		console.log("Failed: Stopped waiting for tests to complete after "+max+"ms.");
		phantom.exit(1);
		clearInterval(waiter);
	}, max);
};

var page = new WebPage(), options = phantom.args[0] || "", 
    path = "/tests/run_tests.html?auto=on&log_to_json=1&"+options,
    lastFramework;

page.onConsoleMessage = function (msg) { 
	var d = JSON.parse(msg);
	if (!d.failed) return;
	if (d.framework!=lastFramework) console.log(d.framework+":");
	console.log("\033[31mo    " + d.name + "\033[0m");
	lastFramework = d.framework;
};
page.open(require('fs').workingDirectory+path, function(status){
    if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit();
    } else {
        wait(function(){
            return page.evaluate(function(){
                return window.Eve_results !== undefined;
            });
        }, function(){
            var r = page.evaluate(function(){
                return window.Eve_results;
            });
			console.log(
				( (r.failures>0) ? "Failed" : "Passed") + ": "+(r.passes+"/"+r.total)
			);
            phantom.exit(r.failures);
        });
    }
});
