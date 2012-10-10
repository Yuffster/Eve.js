#!/bin/bash
#
# Eve.js Test Script <evejs.com>
#
# Runs the unit tests (tests/run_tests.html), first normally and then with
# conflicting frameworks for each supported combination.
#
# Usage: ./test.sh <URL parameters>

STATUS=0
URL_OPTS=$1
function phantom {
	phantomjs tests/phantom.js "$URL_OPTS&$1"
	if [ "$?" -gt 0 ]; then
		STATUS=1
	fi
}

# Run unit tests
echo "Running base tests."
phantom
echo "Simulating a jQuery conflict."
phantom conflict=jquery
echo "Simulating a MooTools conflict."
phantom conflict=mootools
echo "Simulating a Dojo conflict."
phantom conflict=dojo
echo "Simulating a YUI conflict."
phantom conflict=yui

exit $STATUS