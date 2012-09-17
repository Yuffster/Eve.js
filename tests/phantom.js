function wait(con, fun, max) {
	var waiter = setInterval(function() {
		if(con()) {
			fun();
			clearInterval(waiter);
		}
	}, 100);
	setTimeout(function() {
		clearInterval(waiter);
	}, max || 5000);
};

var page = new WebPage();

page.open(require('fs').workingDirectory+"/run_tests.html?auto=on", function(status){
    if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit();
    } else {
        wait(function(){
            return page.evaluate(function(){
                return window.Eve_results !== undefined;
            });
        }, function(){
            var failedNum = page.evaluate(function(){
                return window.Eve_results.failures;
            });
			console.log(
				(failedNum==0) ?
				"All tests passed." : failedNum+" failures"
			);
            phantom.exit((parseInt(failedNum, 10) > 0) ? 1 : 0);
        });
    }
});