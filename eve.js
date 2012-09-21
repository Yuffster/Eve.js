/**
 * Eve.js <evejs.com> - Version: 0.6 (September 16, 2012)
 *
 *	   A JavaScript meta-framework for scoped event delegation.
 * 
 * Copyright (c) 2012 Michelle Steigerwalt, http://evejs.com/
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function() {

var _registry = {}, _scopes = {}, _attachments = {}, _extensions = {},
    _debugging = [], _debugAll = false, _framework;

//Detects the current JavaScript framework.
function detectFramework() {

	if (_framework) return _framework;

	var fws = ['jQuery', 'MooTools', 'YUI', 'Prototype', 'dojo'];
	for (var i = 0; i<= fws.length; i++) {
		if (window[fws[i]]) {
			Eve.setFramework(fws[i]);
			return fws[i];
		}
	} console.error("Eve doesn't support your JavaScript framework.");

};

//Either matches the chosen JS framework to the passed guess, or returns the
//current framework.
function using(guess) {
	var fw = _framework || detectFramework();
	return (guess) ? (_framework == guess.toLowerCase()) : _framework;
};

function dbug(name, message) {
		if (!window.console) { return; }
		var debug = _debugAll;
		if (!_debugAll) {
			debug = false;
			for (var i = 0; i<_debugging.length; i++) {
				if (_debugging[i]==name) debug = true;
			}
		}
		if (!debug) { return; }
		while (name.length<10) { name=name+' '; }
		name = name.substring(0, 10)+" - ";
		console.info(name, message);
};

function bindToScope(fun, obj, reg, name) {
	
	for (var k in Scope) obj[k] = Scope[k];
	for (var k in _extensions) obj[k] = _extensions[k];
	
	if (using("YUI")) {
		YUI().use('node', function(Y) {
			Eve.dom  = Y.one;
			reg[name] = fun.apply(obj);
		});
	} else if (using("dojo")) {
		require(["dojo/NodeList-dom", "dojo/NodeList-traverse"], function(dom){
			Eve.dom  = dom;
			reg[name] = fun.apply(obj);
		});
	} else {
		reg[name] = fun.apply(obj);
	}

};

//The primary Eve API.
window.Eve = {
	
	setFramework: function(fw) {
		_framework = (fw+"").toLowerCase();
		if (_framework=='jquery') $ = jQuery; //No-conflict compat.
	},

	debug: function(moduleName) {
		if (moduleName) {
			_debugging.push(moduleName);
		} else {
			_debugAll = true;
		}
	},

	register: function(name, obj) {
		dbug(name, "registered");
		if (_registry[name]) {
			throw new Error("Module already exists: "+name);
		}
		_registry[name] = obj;
		return this;
	},
	
	extend: function(key, fun) {
		_extensions[key] = fun;
	},

	scope: function(ns, fun) {
		if (_scopes[ns]) {
			console.warn("Duplicate namespace: "+ns);
		}
		bindToScope(fun, {
			name: ns,
			namespace: ns
		}, _scopes, ns);
	},

	attach: function(moduleName, namespace) {
		dbug(moduleName, "attached to "+namespace);
		//We're delegating off the window, so there's no need to reattach for
		//multiple instances of a single given module.
		if (_attachments[moduleName+namespace]) {
			return false;
		}
		if (!_registry[moduleName]) {
			console.warn("Module not found: "+moduleName);
			return false;
		}
		var mod = bindToScope(_registry[moduleName], {
			namespace:namespace,
			name:moduleName
		}, _attachments, moduleName+namespace);
		return true;
	}

};

var Scope = {
	
	listen: function(selector, event, handler) {
		
		//There's a special hell for putting optional parameters at the
		//beginning.  A special and awesome hell.
		if (!handler) {
			handler = event;
			event = selector;
			selector = '';
		}
		selector = selector || '';

		//If listen is happening in the context of a triggered event handler,
		//we only want to delegate to the current event namespace.
		var scope = (this.event) ? this.find() : document.body;

		var name = this.name,
			sel	 = (this.namespace+' '+selector).trim(),
			obj  = { };
			for (k in this) if (this.hasOwnProperty(k))	obj[k] = this[k];
			function fun(e,t) {
				dbug(name, sel+':'+event);
				obj.event = e;
				if (using("MooTools")) { e.target = t; }
				if (using("jQuery"))   { e.target = e.currentTarget; }
				if (using("dojo"))     { e.target = e.explicitOriginalTarget; }
				handler.apply(obj, arguments);
			};

		//JavaScript framework development is so much easier when you let some
		//other framework do most of the work.
		if (using("jQuery")) {
			$(scope).delegate(sel, event, fun);
		} else if (using('MooTools')) {
			//I really hate the MooTools event delegation syntax.
			$(scope).addEvent(event+':relay('+sel+')', fun);
		} else if (using("YUI")) {
			Eve.dom(scope).delegate(event, fun, sel);
		} else if (using("Prototype")) {
			$(scope).on(event, sel, fun);
		} else if (using("dojo")) {
			require(["dojo/on"], function(on){
				on(scope, sel+':'+event, fun);
			});
		}

	},

	//Yo dawg...
	scope: function(ns, fun) {
		Eve.scope(this.namespace+' '+ns, fun);
	},

	//This method is bound to the namespaced closure.
	attach: function(moduleName, ns) {
		Eve.attach(moduleName, this.namespace+' '+(ns||''));
	},

	find: function(sel) {
		var scope;
		if (!sel || typeof(sel)=='string') { sel = (sel || '').trim(); }
		//Scope to the particular instance of the DOM module active in this
		//event.
		if (this.event) {
			var t = this.event.target;
			if (using('jQuery')) t = jQuery(t);
			var map = {
				jQuery: ['is', 'parents', 'find'],
				MooTools: ['match', 'getParent', 'getElements'],
				Prototype: ['match', 'up', 'select'],
				YUI: ['test', 'ancestor', 'all']
			};
			for (var fw in map) {
				if (!using(fw)) continue;
				var m = map[fw], match = m[0], up = m[1], all = m[2];
				if (t[match](this.namespace)) return t;
				scope = t[up](this.namespace);
				return (sel) ? scope[all](sel) : scope;
			}
			if (using('dojo')) {
				//Dojo returns the current node if it matches the selector.
				scope = Eve.dom(t).closest(this.namespace);
				return (sel) ? scope.query(sel) : scope;
			}
		//Scope to the DOM namespace across all instances.
		} else {
			sel = this.namespace+' '+sel;
			if (using('jQuery')||using('Prototype')) {
				return $(sel);
			} else if (using('MooTools')) {
				return $$(sel);
			}
		}
	}
	
};

})();