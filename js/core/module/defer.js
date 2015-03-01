/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Helper for Promise
 * 
 * @author Mautilus s.r.o.
 * @class Defer
 * @singleton
 */

Defer = (function() {
	return {
		/**
		 * Create new Promise and call given callback with the Promise as a first argument
		 * 
		 * @param {Function} callback
		 * @param {Object} [scope=Promise]
		 * @returns {Promise}
		 */
		when: function(callback, scope) {
			var promise = new Promise();

			callback.call(scope || promise, promise);

			return promise;
		},
		/**
		 * Create new Promise and call all given callbacks with the Promise as a first argument
		 * 
		 * @param {Function} callbacks
		 * @returns {Promise}
		 */
		all: function() {
			var promise = new Promise(),
				pending = 0,
				resolved = 0,
				args;

			args = Array.prototype.slice.call(arguments);
			pending = args.length;

			args.map(function(p) {
				p.then(function(status, delay) {
					pending--;

					if (status) {
						resolved++;
					}

					if (pending == 0) {
						if (resolved == args.length) {
							promise.resolve(resolved);

						} else {
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
			var promise = new Promise();

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
			var promise = new Promise();

			setTimeout(function() {
				if (callback) {
					callback.call(scope || promise);
				}

				promise.resolve();
			}, 0);

			return promise;
		}
	};
})();