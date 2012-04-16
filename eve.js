/**
 * Eve.js <evejs.com> - Version: 0.2 (April 15, 2012)
 *
 *     A JavaScript meta-framework for scoped event delegation.
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
var Eve = {

    __registry: {},

    __scopes: {},

    __attachments: {},

    __debugging: [],

    __debugAll: false,
    
    dbug: function(name, message) {
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
        obj.prototype.del = this.delegateScoped;
        this.__registry[name] = obj;
        return this;
    },

    scope: function(ns, fun) {
        if (this.__scopes[ns]) {
            console.warn("Duplicate namespace: "+ns);
        }
        this.__scopes[ns] = fun.apply({
            name: ns,
            namespace: ns,
            listen: this.delegateScoped,
            attach: this.attachFromScope
        }, [ns]);
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
        var mod = this.__registry[moduleName].apply({
            namespace:namespace,
            listen:this.delegateScoped,
            name:moduleName
        }, [namespace]);
        this.__attachments[moduleName+namespace] = mod;
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
        var name = this.name,
            sel  = (this.namespace+' '+selector).trim(),
            fun  = function() {
                Eve.dbug(name, sel);
                //Simple pass-through of scope and arguments.
                handler.apply(this, arguments);
            };
        //JavaScript framework development is so much easier when you let some
        //other framework do most of the work.
        if (window.jQuery) {
            $(window).delegate(sel, event, fun);
        } else if (window.MooTools) {
            //I really hate the MooTools event delegation syntax.
            $(window).addEvent(event+':relay('+sel+')', fun);
        } else if (window.YUI) {
            YUI().use('node', function(Y) {
                Y.one(document.body).delegate(event, fun, sel);
            });
        } else if (window.Prototype) {
            $(document.body).on(event, sel, fun);
        } else if (window.dojo) {
            require(["dojo/on"], function(on){
                on(document, sel+':'+event, fun);
            });
        } else {
            console.error("Eve doesn't support your JavaScript framework.");
        }
    },

    //This method is bound to the namespaced closure.
    attachFromScope: function(moduleName, ns) {
        Eve.attach(moduleName, this.namespace+' '+(ns||''));
    }

};