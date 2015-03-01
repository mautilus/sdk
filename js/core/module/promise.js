/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Promise implementation
 * 
 * @author Mautilus s.r.o.
 * @class Promise
 */

Promise = (function() {

	var Promise = function() {
		/**
		 * @property {Number} state
		 * State of promise STATE_PENDING | STATE_RESOLVED | STATE_REJECTED
		 */

		this.STATE_PENDING = 1001;
		this.STATE_RESOLVED = 1002;
		this.STATE_REJECTED = 1003;

		this.construct.apply(this, arguments);
	};

	$.extend(true, Promise.prototype, {
		/**
		 * @constructor
		 */
		construct: function() {
			this.state = this.STATE_PENDING;
			this.stack = [];
			this.args = [];
		},
		/**
		 * Add callback that will be called when promise is resolved or rejected, it's boolean status is passed as a first argument
		 * 
		 * @chainable
		 * @param {Function} callback
		 * @param {Object} [scope=this]
		 */
		then: function(callback, cbscope) {
			return this.pushCallback('then', arguments);
		},
		/**
		 * Add callback that will be called only when resolved
		 * 
		 * @chainable
		 * @param {Function} callback
		 * @param {Object} [scope=this]
		 */
		done: function(callback, cbscope) {
			return this.pushCallback('done', arguments);
		},
		/**
		 * Add callback that will be called only when rejected
		 * 
		 * @chainable
		 * @param {Function} callback
		 * @param {Object} [scope=this]
		 */
		fail: function(callback, cbscope) {
			return this.pushCallback('fail', arguments);
		},
		/**
		 * Resolve promise, arguments are optional and will be passed to callbacks
		 */
		resolve: function() {
			this.state = this.STATE_RESOLVED;
			this.callStack(arguments);
		},
		/**
		 * Reject promise, arguments are optional and will be passed to callbacks
		 */
		reject: function() {
			this.state = this.STATE_REJECTED;
			this.callStack(arguments);
		},
		/**
		 * @private
		 */
		pushCallback: function(type, args) {
			var promise, fn;

			args = Array.prototype.slice.call(args);
			args.unshift(type);
			this.stack.push(args);

			if (this.state !== this.STATE_PENDING) {
				this.callStack();
			}

			return this;
		},
		/**
		 * @private
		 */
		callStack: function(args) {
			var state = (this.state === this.STATE_RESOLVED ? 'done' : 'fail'), tmp;

			if (args) {
				this.args = args;
			}

			(args = Array.prototype.slice.call(args || this.args)).unshift(this.state === this.STATE_RESOLVED);

			for (var i in this.stack) {
				tmp = this.stack[i];
				this.stack[i] = null;
				
				if (tmp && tmp[0] === state) {
					if (typeof tmp[1] === 'function') {
						tmp[1].apply(tmp[2] || this, args.slice(1));
					}

				}
				else if (tmp && tmp[0] === 'then') {
					if (typeof tmp[1] === 'function') {
						tmp[1].apply(tmp[2] || this, args);
					}
				}
			}
		}

	});

	return Promise;

})();