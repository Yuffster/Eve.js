# Eve.js API Reference

## Global Methods

### Eve.scope

Scopes the given function to a particular CSS namespace. Eve attaches listen and attach methods to each scoped function. When calling these methods from within the function, you'll automatically remain within the scoped namespace.

#### Syntax

Eve.scope(namespace, function);

#### Arguments

- namespace (string): The CSS selector of the elements which will be effected by the provided function.
- function (function): This function will be responsible for all code related to the given CSS namespace.

#### Example

	Eve.scope('.hello-world', function() {

	    this.listen('div.line', 'click', function(e) {
	        console.log("You clicked on .hello-world div.line");
	    });

	});

### Eve.register

Allows you to register a reusable module which can then be utilized via the attach method. Module functions have no default namespace of their own, and instead will rely on the namespace provided when attaching.

#### Syntax

Eve.register(moduleName, function);

#### Arguments

- moduleName (string): The name of the module. This can be anything, as long as it's unique.
- function (function): This function will be run within a scoped namespace when attached. Note: this function will only run ONCE per namespace.

#### Example

	Eve.register('myAwesomePlugin', function() {

	    this.listen('a', 'click', function() {
	        console.log("You clicked on a link within my namespace!");
	    });

	    //Since no namespace is provided, this event will be triggered by
	    //any click events within the scoped namespace.
	    this.listen('click', function() {
	        alert("You clicked somewhere within my namespace!");
	    });

	});


	//Now, we're giving the module a scoped namespace to work with,
	//effectively attaching events to "#section-of-my-site" and
	//"#section-of-my-site a".
	Eve.attach('myAwesomePlugin', '#section-of-site');

### Eve.extend

Provides a method of extending Eve.js's native scoped methods with custom ones.

#### Syntax

Eve.extend(methodName, function);

#### Arguments

- methodName (string): The name of the new Eve.js scoped method.
- function (function): The function to be executed when the new scoped method is called.

#### Example

	Eve.extend('handle', function(key, e, fun) {
		//this.listen will be limited to the scope of the code which called
		//the handle method.
		this.listen('[data-action='+key+']', e, fun);
	});

	Eve.scope('.extended-area', function() {
	
		//Handle is now available within this scope.
		this.handle('bing', 'click', function(e) {
			e.target.innerHTML = 'Bing';
		});
	
	});

### Eve.attach

Attaches a previously registered module to the specified CSS namespace.

#### Syntax

Eve.attach(moduleName, namespace);

#### Arguments

- moduleName (string): The name of the module to attach. It must have previously been registered using Eve.register.
- namespace (string): The CSS selector of the elements which will be effected by the named module.

#### Example

	Eve.register('myAwesomePlugin', function() {

	    this.listen('a', 'click', function() {
	        console.log("You clicked on a link within my namespace!");
	    });

	});

	Eve.attach('myAwesomePlugin', '#section-of-site');

### Eve.debug

Logs detailed information concerning event execution and responsible modules to to the console.

#### Syntax

Eve.debug([moduleName]);

#### Arguments

- moduleName (optional): If a module name is provided, only events the given module is listening to will be logged. If no moduleName is provided, all events will be logged to the console.

#### Example

	Eve.debug('myAwesomeModule');

## Scoped Methods

Eve attaches the following methods to each scoped function attached via Eve.scope or Eve.register. When calling these methods from within the function, you'll automatically remain within the scoped namespace.

### Scope.listen

Begins watching for events which match the particular eventType and CSS selector, as long as the given CSS selector is part of the parent namespace.

#### Syntax

this.listen([selector,] eventType, handler);

#### Arguments

- selector (string, optional): The CSS selector of the elements you want to attach events to. If no selector is given, any event of the given type within the scoped namespace will invoke the handler.
- eventType (string): The event type, such as click or mouseover.
- handler (function): The function to call when the specified event type has taken place on a matching element.

#### Example

	Eve.scope('#section-of-my-site', function() {

	    this.listen('a', 'click', function() {
	        console.log("You clicked on a link within my namespace!");
	    });

	});
	
### Scope.attach

Works exactly like Eve.attach, but will confine the attached module to the current scope.

#### Example

	Eve.register('myAwesomePlugin', function() {

	    this.listen('a', 'click', function() {
	        console.log("You clicked on a link within my namespace!");
	    });

	});

	Eve.scope('#section-of-my-site', function() {

	    //This will attach the named module to the namespace of
	    //"#section-of-my-site .subsection".
	    this.attach('myAwesomePlugin', '.subsection');

	});

### Scope.find

Finds elements from within the context of the current scoped instance. If called from a scope, find will return all elements matching the given selector within the parent namespace.  If called from an event (listen) handler, only elements within the same instance of the parent scope from which the event has been called will be returned.

#### Syntax

this.find(selector);

#### Arguments

- selector (string): A CSS selector.  If no selector is provided, the result will be either a list of nodes matching the parent namespace selector or a single element representing the parent namespace of the current event target.

#### Returns

When inside of a base .scope method, file will return the result of host framework query, which will usually be an array or nodelist.

If this.find is called with no arguments within a .listen event, however, the result will be the parent element of the current event target.

#### Example

	Eve.scope('.image-slideshow', function() {

		//Will return all .image-slideshow img items.
		this.find('img');
		
		//Will return all '.image-slideshow' elements on the page.
		this.find();
		
	    this.listen('a', 'click', function() {
		
			// Only returns img.active items within the current
			// .image-slideshow element.
	        this.find('img.active');
	
			//Returns the parent .image-slideshow element of ONLY
			//the current event target.
			this.find();
	
	    });

	});
	
### Scope.first

An alias of `.find` which only returns the first result.

#### Syntax

this.first(selector);

#### Arguments

- selector (string): A CSS selector.

#### Example

	Eve.scope('.image-slideshow', function() {

		//Will return the first img item.
		this.first('img');

	});