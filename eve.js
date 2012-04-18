/**
 * Eve.js <evejs.com> - Version: 0.2 (April 15, 2012)
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
window.Eve = {

	__registry: {},

	__scopes: {},

	__attachments: {},

	__debugging: [],

	__debugAll: false,

	dbug: function(name, message) {
		if (!window.console) { return; }
		var debug = this.__debugAll;
		if (!this.__debugAll) {
			debug = false;
			for (var i = 0; i<this.__debugging.length; i++) {
				if (this.__debugging[i]==name) debug = true;
			}
		}
		if (!debug) { return; }
		while (name.length<10) { name=name+' '; }
		name = name.substring(0, 10)+" - ";
		console.info(name, message);
	},

	debug: function(moduleName) {
		if (moduleName) {
			this.__debugging.push(moduleName);
		} else {
			this.__debugAll = true;
		}
	},

	register: function(name, obj) {
		this.dbug(name, "registered");
		if (this.__registry[name]) {
			throw new Error("Module already exists: "+name);
		}
		this.__registry[name] = obj;
		return this;
	},

	bindToScope: function(fun, obj, reg, name) {
		var defaults = {
			listen: this.delegateScoped,
			find: this.findFromScope,
			attach: this.attachFromScope
		};
		for (var k in defaults) obj[k] = defaults[k];
		if (window.YUI) {
			YUI().use('node', function(Y) {
				Eve.dom  = Y.one;
				Eve[reg][name] = fun.apply(obj);
			});
		} else if (window.dojo) {
			require(["dojo/NodeList-dom", "dojo/NodeList-traverse"], function(dom){
				Eve.dom  = dom;
				Eve[reg][name] = fun.apply(obj);
			});
		} else {
			Eve[reg][name] = fun.apply(obj);
		}
	},

	scope: function(ns, fun) {
		if (this.__scopes[ns]) {
			console.warn("Duplicate namespace: "+ns);
		}
		this.bindToScope(fun, {
			name: ns,
			namespace: ns
		}, '__scopes', ns);
	},

	attach: function(moduleName, namespace) {
		this.dbug(moduleName, "attached to "+namespace);
		//We're delegating off the window, so there's no need to reattach for
		//multiple instances of a single given module.
		if (this.__attachments[moduleName+namespace]) {
			return false;
		}
		if (!this.__registry[moduleName]) {
			console.warn("Module not found: "+moduleName);
			return false;
		}
		var mod = this.bindToScope(this.__registry[moduleName], {
			namespace:namespace,
			name:moduleName
		}, '__attachments', moduleName+namespace);
		return true;
	},

	//This method is bound to the namespaced closure.
	delegateScoped: function(selector, event, handler) {

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
			function fun(e) {
				Eve.dbug(name, sel+':'+event);
				obj.event = e;
				handler.apply(obj, arguments);
			};

		//JavaScript framework development is so much easier when you let some
		//other framework do most of the work.
		if (window.jQuery) {
			$(scope).delegate(sel, event, fun);
		} else if (window.MooTools) {
			//I really hate the MooTools event delegation syntax.
			$(scope).addEvent(event+':relay('+sel+')', fun);
		} else if (window.YUI) {
			Eve.dom(scope).delegate(event, fun, sel);
		} else if (window.Prototype) {
			$(scope).on(event, sel, fun);
		} else if (window.dojo) {
			require(["dojo/on"], function(on){
				on(scope, sel+':'+event, fun);
			});
		} else {
			console.error("Eve doesn't support your JavaScript framework.");
		}

	},

	//This method is bound to the namespaced closure.
	attachFromScope: function(moduleName, ns) {
		Eve.attach(moduleName, this.namespace+' '+(ns||''));
	},
	
	//This method is bound to the namespaced closure.
	attachFromScope: function(moduleName, ns) {
		Eve.attach(moduleName, this.namespace+' '+(ns||''));
	},
	
	findFromScope: function(sel) {
		var scope;
		sel = (sel || '').trim();
		//Scope to the particular instance of the DOM module active in this
		//event.
		if (this.event) {
			var t = (window.$) ? $(this.event.target) : this.event.target;
			var map = {
				jQuery: ['is', 'parents', 'find'],
				MooTools: ['match', 'getParent', 'getChildren'],
				Prototype: ['match', 'up', 'select'],
				YUI: ['test', 'ancestor', 'all']
			};
			for (var fw in map) {
				if (!window[fw]) continue;
				var m = map[fw], match = m[0], up = m[1], all = m[2];
				if (t[match](this.namespace)) return t;
				scope = t[up](this.namespace);
				return (sel) ? scope[all](sel) : scope;
			}
			if (window.dojo) {
				//Dojo returns the current node if it matches the selector.
				scope = Eve.dom(t).closest(this.namespace);
				return (sel) ? scope.query(sel) : scope;
			}
		//Scope to the DOM namespace across all instances.
		} else {
			sel = this.namespace+' '+sel;
			if (window.jQuery||window.Prototype) {
				return $(sel);
			} else if (window.MooTools) {
				return $$(sel);
			}
		}
	}

};