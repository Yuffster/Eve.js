(function() {
	
	// Event simulation code taken from:
	// http://stackoverflow.com/questions/6157929/#answer-6158050
	function simulate(element, eventName, options)
	{
		if (typeof(element)==='string') {
			element = document.getElementById(element);
		}
		
		options = options || {};
		
		var eventMatchers = {
			'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
			'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
		};
		
		var defaultOptions = {
			pointerX: 0,
			pointerY: 0,
			button: 0,
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false,
			bubbles: true,
			cancelable: true
		};
	
		var options = defaultOptions;
		var oEvent, eventType = null;

		for (var name in eventMatchers) {
			if (eventMatchers[name].test(eventName)) { eventType = name; break; }
		}

		if (!eventType) {
			throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
		}
		
		if (document.createEvent) {
			oEvent = document.createEvent(eventType);
			if (eventType == 'HTMLEvents') {
				oEvent.initEvent(eventName, options.bubbles, options.cancelable);
			} else {
				oEvent.initMouseEvent(
					eventName, options.bubbles, options.cancelable, document.defaultView,
					options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
					options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element
				);
			}
			element.dispatchEvent(oEvent);
		} else {
			options.clientX = options.pointerX;
			options.clientY = options.pointerY;
			var evt = document.createEventObject();
			oEvent = extend(evt, options);
			element.fireEvent('on' + eventName, oEvent);
		}

		return element;
	};
	
	test("Should allow for registering modules and attaching them to named scopes.", function() {
		
		//The test module is a rot-13 encoding module.
		var results = {
			'm1-1':"Yvax Bar",
			'm1-2':"Yvax Gjb",
			'm1-3':"Yvax Guerr",
			'm2-1':"Yvax Sbhe",
			'm2-2':"Yvax Svir",
			'm2-3':"Yvax Fvk",
		};
		
		var k,el,original;
		for (k in results) {
			el = document.getElementById(k);
			original = el.innerHTML;
			simulate(el, 'mouseover');
			ok(results[k]==el.innerHTML, "Change #"+k+" on hover.");
			simulate(el, 'mouseout');
			ok(original==el.innerHTML, "Restore #"+k+" on mouseout.");
		}
	
	});
	
	test("Should scope .find to a CSS namespace.", function() {
		var oconsole = console.log, output;
		console.log = function(m) { output=m; }
		simulate('m3-ul', 'click');
		console.log = oconsole;
		ok(output=="Inner module click!", "Click event recognized.");
	});
	
	test("Should scope .attach to a CSS namespace.", function() {
		var results = {
			'm3-1':"Yvax Bar",
			'm3-2':"Yvax Gjb",
			'm3-3':"Yvax Guerr",
		};
		var k,el,original;
		for (k in results) {
			el = document.getElementById(k);
			original = el.innerHTML;
			simulate(el, 'mouseover');
			ok(results[k]==el.innerHTML, "Change #"+k+" on hover.");
			simulate(el, 'mouseout');
			ok(original==el.innerHTML, "Restore #"+k+" on mouseout.");
		}
	});
	
	test("Should scope module .find to child CSS namespace.", function() {
		var i,id,el,active;
		for (i=1;i<=3;i++) {
			id = 'm1-'+i;
			el = simulate(id, 'click');
			active = document.getElementById('m1').getElementsByClassName('active');
			ok(active.length==1, "Only one active child element.");
			ok(active[0].id == id, "Active element has the correct ID.");
		}
	});
	
	test("Should scope listener .find to event namespace.", function() {
		var el1 = simulate('m1-1', 'click'),
		    el2 = simulate('m2-1', 'click');
		ok(el1.className=='active', "Clicked module one element is active.");
		ok(el2.className=='active', "Clicked module two element is active.");
		ok(el1.className=='active', "Clicked module one element is still active.");
	});
	
	test("Should allow for extending Eve.js with additional scoped methods", function() {
		
		Eve.extend('handle', function(key, e, fun) {
			this.listen('[data-action='+key+']', e, fun);
		});
		
		Eve.scope('.extended-area', function() {
			
			this.handle('bing', 'click', function(e) {
				e.target.innerHTML = 'Bing';
				if (e.target.setHTML) e.target.setHTML('Bing');
			});
			
		});
		
		var bing  = simulate('bing-target', 'click'), 
		    bing2 = simulate('bing-target2', 'click');

		ok(bing.innerHTML  == 'Bing', 'Event handled correctly.');
		console.log(bing2.innerHTML);
		ok(bing2.innerHTML == 'Ping', "Extended namespace doesn't leak past its namespace.");
		
	});
	
})();