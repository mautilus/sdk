/*
 *******************************************************************************
 * Copyright (c) 2013 Mautilus, s.r.o. (Czech Republic)
 * All rights reserved
 *  
 * Questions and comments should be directed https://github.com/mautilus/sdk/issues
 *
 * You may obtain a copy of the License at LICENSE.txt
 *******************************************************************************
 */

/**
 * Deferrable abstract class with methods to register multiple callbacks into queues and call these callbacks and relay the success or failure state of each called function
 * 
 * @author Mautilus s.r.o.
 * @class Deferrable
 * @abstract
 */

Deferrable = (function() {
	return {
		/**
         * @private
		 * @property {Object} promises Deferrable promises
		 */
		promises: null,
		/**
		 * Push new Promise into the stack and return Promise in parameter
		 * 
		 * @private
		 * @param {Promise} Promise
		 * @returns {Promise} Promise
		 */
		pushPromise: function(promise) {
			if (this.promises === null) {
				this.promises = [];
			}

			this.promises.push(promise);
			
			return promise;
		},
		/**
		 * Reject all Promises in the stack
		 * 
		 */
		rejectAll: function() {
			if(this.promises){
				for(var i in this.promises){
					if(this.promises.hasOwnProperty(i) && this.promises[i]){
						this.promises[i].reject();
					}
				}
			}
		},
		/**
		 * Create new Promise and call given callback with the Promise as a first argument
		 * 
		 * @param {Function} callback
		 * @param {Object} [scope=Promise]
		 * @returns {Promise}
		 */
		when: function(callback, scope) {
			var promise = this.pushPromise(new Promise());

			callback.call(scope || this, promise);

			return promise;
		},
		/**
		 * Create new Promise and call all given callbacks with the Promise as a first argument
		 * 
		 * @param {Promise} [promises]
		 * @returns {Promise}
		 */
		all: function() {
			var promise = this.pushPromise(new Promise()),
				pending = 0,
				resolved = 0,
				args;

			args = Array.prototype.slice.call(arguments);
			pending = args.length;

			args.map(function(p) {
				p.then(function(status) {
					pending--;

					if (status) {
						resolved++;
					}

					if (pending === 0) {
						if (resolved === args.length) {
							promise.resolve(resolved);

						}
						else {
							promise.reject(resolved);
						}
					}
				});
			});

			return promise;
		},
		/**
		 * Create new Promise and resolve it after given timeout
		 * 
		 * @param {Number} [ms=0] Timeout in miliseconds
		 * @returns {Promise}
		 */
		timeout: function(ms) {
			var promise = this.pushPromise(new Promise());

			setTimeout(function() {
				promise.resolve(ms || 0);
			}, ms || 0);

			return promise;
		},
		/**
		 * Defered promise with timeout=0
		 * 
		 * @param {Function} callback
		 * @param {Object} [scope=Promise]
		 * @returns {Promise}
		 */
		lag: function(callback, scope) {
			var promise = this.pushPromise(new Promise());

			setTimeout(function() {
				if (callback) {
					callback.call(scope || this, promise);
				}

				promise.resolve();
			}, 0);

			return promise;
		}
	};
})();