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
 * @author Mautilus s.r.o.
 * @ignore
 */

if (typeof jQuery !== 'undefined') {
	jQuery.fn.extend({
		/**
		 * $().belongsTo() Check if subset belong to a specified parent element
		 * 
		 * @ignore
		 * @param {Object} parent Parent element, HTMLElement or jQuery collection
		 * @returns {Boolean}
		 */
		belongsTo: document && document.contains ? 
			function(parent) {
				// used native function 'node.contains()'
				var parentEl = (parent && parent.nodeType ? parent : parent[0]),
					currEl = this[0];
				
				if(parentEl && currEl) {
					return parentEl.contains(currEl);
				}
				return false;
			} :
			function(parent) {
				// traversing in cycle
				var parentEl = (parent && parent.nodeType ? parent : parent[0]),
					currEl = this[0];
				
				if (currEl) {
					while ( (currEl = currEl.parentNode) ) {
						if (currEl === parentEl) {
							return true;
						}
					}
				}
				return false;
			}
	});
}

/*
 * Binding function for prevent scope or global variables.
 * 
 * @param {Function} func called function
 * @param {Object} scope which scope has to function use ?
 * @param {Array} addArg array of arguments which are passed to function
 * @returns {Function} returns new function
 */
function bind(func, scope, addArg) {
	return function () {
		if (addArg) {
			var args = Array.prototype.slice.call(arguments);
			return func.apply(scope, args.concat(addArg));
		}
		else return func.apply(scope, arguments);
	};
}

/**
 * Shortcut to the I18n.translate method
 * 
 * @returns {String};
 */
function __() {
	return I18n.translate.apply(I18n, arguments);
}

/**
 * Convert seconds to movie duration, e.g. 125 min
 * 
 * @param {Number} seconds
 * @returns {String};
 */
function secondsToDuration(seconds) {
	return Math.round(seconds / 60) + ' min';
}

/**
 * Convert seconds to hours, e.g. 0:05:23
 * 
 * @param {Number} seconds
 * @returns {String};
 */
function secondsToHours(seconds) {
	var hours = Math.floor(seconds / 3600),
		minutes = Math.floor((seconds - (hours * 3600)) / 60);
		seconds = Math.floor(seconds - (hours * 3600) - (minutes * 60));

	return hours + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
}

/**
 * Convert seconds to minutes, e.g. 05:23
 * 
 * @param {Number} seconds
 * @returns {String};
 */
function secondsToMinutes(seconds) {
	var minutes = Math.floor((seconds) / 60);
		seconds = Math.floor(seconds - (minutes * 60));

	return ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
}

/* Modify objects */

//checks if it isn't function implemented yet.
if (!String.prototype.trim) {
	/*
	 * This function removes all white spaces after / behind the string
	 * 
	 * @returns {String};
	 */
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

//checks if it isn't function implemented yet.
if (!String.prototype.replaceAll) {
	/*
	 * This function replace all occurrence of string inside the string.
	 * 
	 * @param {String} a string which the function is looking for
	 * @param {String} b string for replace
	 * @returns {String};
	 */
	String.prototype.replaceAll = function (a, b) {
		if (!a || !b) return this;
		return this.replace(new RegExp(a, 'gm'), b);
	};
}

//checks if it isn't function implemented yet.
if (!String.prototype.contains) {
	/*
	 * This function returns flag, if the string contains substring
	 * 
	 * @param {String} a substring
	 * @returns {Boolean};
	 */
	String.prototype.contains = function (a) {
		if (this.indexOf(a) >= 0) return true;
		else return false;
	};
}

// checks if it isn't function implemented yet.
if (!String.prototype.format) {
	/*
	 * Replaces each format item in a specified string with the text equivalent of a corresponding object's value. Works like String.Format in C#
	 * @returns {String}
	 */
	String.prototype.format = function () {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] != 'undefined'
				? args[number]
				: match
			;
		});
	};
}

//checks if it isn't function implemented yet.
if (!String.prototype.ucfirst) {
	/*
	 * Convert string to the string with first letter in uppercase. Example: first -> First
	 * @returns {String}
	 */
	if (!String.prototype.ucfirst) {
		String.prototype.ucfirst = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		}
	}
}
