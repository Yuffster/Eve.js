# Eve.js Changelog

## v0.8.3 (Nov 24, 2012)

* Omitted duplicate variable declaration

## v0.8.2 (Nov 23, 2012)

* Fixed leaky undeclared variable.

## v0.8.1 (Sep 24, 2012)

* Moved assertion methods outside of Eve scopes for more reliable testing
* Internal file reorganization and general polish
* Added Eve.js to CDNJS <cdnjs.com>

## v0.8 (Sep 23, 2012)

* **API UPDATE**: Added Eve.extend, which allows for extending base scoped methods with new ones
* **API UPDATE**: Added the ability to use `this.scope` within parent scopes
* **API UPDATE**: Eve.setFramework method to allow the user to specify which framework to use in the event of multiple frameworks attached to the window element
* **API UPDATE**: It's now possible to pass arguments when attaching modules.
* **API UPDATE**: Created a .first() method which returns the first result from an array of results
* **BUGFIX**: Fixed results of .find with no arguments
* Improved test runner for Internet Explorer
* Refactored to provide two "classes", `Eve` and `Scope`, which are consistent with the public API
* Non-API methods and variables moved to internal closure
* Added test mechanisms for testing any host framework with a conflicting host framework
* Run through every framework conflict possibility during integration test
* Simplified Scope.find by combining standard find and event-contextual find

## v0.6 (Sep 16, 2012)

* Unit test suite which isolates each host framework in its own environment
* Travis Build Integration

## v0.4 (Apr 19, 2012)

* **API UPDATE**: Added a find method to scopes which traverses either the global selector namespace or the local event namespace to find its match
* **API UPDATE**: Listen method now delegates to current event scope when run from an event callback
* **YUI, Dojo**: Now waiting for YUI and Dojo's asynchonous loading to occur before attaching their respective DOM handlers to a local variable so find can happen even in all scoped methods (not just events)
* **MooTools**: Swapped MooTools.getChildren for MooTools.getElements for scoped event find
* **MooTools**: Normalized event delegation syntax by binding the delegate target to event instead of a child event target
* **jQuery**: normalization of event target when delegating
* Tweaked find syntax so elements may also be passed as selectors

## v0.2 (Apr 15, 2012)

* Eve.js now exists.