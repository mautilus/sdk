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
 * Collection abstract class
 * 
 * @author Mautilus s.r.o.
 * @class Collection
 * @abstract
 * @mixins Events
 * @mixins Deferrable
 */

Collection = (function(Events, Deferrable, Model) {

	var Collection = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Collection.prototype, Events, Deferrable, {
        /**
         * @property {Object} config Configuration of current collection
         */
        /**
         * @property {Model} model Reference which Model object be used
         */
        /**
         * @property {Array} models list of items (models) in the collection
         */
        /**
         * @property {Number} length how many items is stored in this collection
         */
        /**
         * @property {Object} sortBy according to this property list of items can be sorted 
         */

		/**
		 * Construct Collection object
		 * 
         * @param {Model} model reference to the Model which be used inside the collection
         * @param {Object} [config] configuration of current collection
		 * @constructor
		 */
		construct: function(models, config) {
			if(! config && !(models instanceof Array)){
				config = $.extend(true, {}, models);
				models = [];
			}
			
			this.config = config || {};
			
			if(! this.model){
				this.model = this.config.model || Model;
			}
			
			if(! this.sortBy){
				this.sortBy = this.config.sortBy;
			}
			
			this.reset(models);
			this.init();
		},
		/**
		 * Destruct object. It means calling reseting and deinitializations
		 * 
		 * @private
		 */
		desctruct: function() {
			this.reset();
			this.deinit();
		},
		/**
		 * Initialise collection
		 * 
		 * @template
		 */
		init: function() {

		},
		/**
		 * De-initialise collection
		 * 
		 * @template
		 */
		deinit: function() {

		},
		/**
		 * Create a new model
		 * 
		 * @param {Object} model
		 * @returns {Model}
		 */
		createModel: function(model){
			if(this.model && typeof this.model === 'function' && !(model instanceof this.model)){
				return (new this.model(model));
			}
			
			return model;
		},
		/**
		 * Removes all models and adds new specified models. Use this function for filling of list of items (models) in collection
         * 
		 * @fires reset
         * @param {Array} [models]
		 */
		reset: function(models) {
			this.models = [];
			
			if(models){
				this.push(models);
			}
			
			this.length = this.models.length;
			
			this.trigger('reset');
		},
		/**
		 * Sort collection with given callback or sort according to `this.sortBy` property if no callback is specified
		 * 
		 * @param {Function} [callback]
		 */
		sort: function(callback) {
			var scope = this;

			if (callback) {
				this.models.sort(callback);

			} else if (this.sortBy) {
				this.models.sort(function(a, b) {
					var _a = a.get(scope.sortBy),  _b = b.get(scope.sortBy);

					if (String(_a).match(/^[\d\.\-]+$/) || String(_b).match(/^[\d\.\-]+$/)) {
						return parseFloat(_a) - parseFloat(_b);

					} else {
						return _a - _b;
					}
				});
			}
		},
		/**
		 * Add new model to the end
         * 
         * @fires push
         * @fires change
		 * @param {Object} model Hash or Model or Array of models
		 */
		push: function(model) {
			var m;
			
			if(model instanceof Array){
				for(var i in model){
					if(model.hasOwnProperty(i)){
						this.push(model[i]);
					}
				}
				
				return;
			}
			
			m = this.createModel(model);
			
			this.models.push(m);
			this.length = this.models.length;
			
			this.trigger('push', m);
			this.trigger('change');
		},
		/**
		 * Add new model to the beginning 
		 * 
         * @fires unshift
         * @fires change
		 * @param {Object} model Hash or Model or Array of models
		 */
		unshift: function(model) {
			var m;
			
			if(model instanceof Array){
				for(var i in model){
					if(model.hasOwnProperty(i)){
						this.unshift(model[i]);
					}
				}
				
				return;
			}
			
			m = this.createModel(model);
			
			this.models.unshift(m);
			this.length = this.models.length;
			
			this.trigger('unshift', m);
			this.trigger('change');
		},
		/**
		 * Remove specified Model (or index) from the collection
		 * 
         * @fires remove
         * @fires change
		 * @param {Model/Number} model Index or Model instance
		 * @returns {Boolean} TRUE on success
		 */
		remove: function(model) {
			var idx;
			
			if(typeof model !== 'object'){
				idx = model >> 0;
			
			} else {
				idx = this.models.indexOf(model);
			}
			
			if(idx >= 0){
				this.models.splice(idx, 1);
				this.length = this.models.length;
				
				this.trigger('remove', model);
				this.trigger('change');
				
				return true;
			}
			
			return false;
		},
		/**
		 * Return a Model from a collection by it's index
		 * 
		 * @param {Number} idx Index
		 * @returns {Model}
		 */
		at: function(idx){
			return this.models[idx];
		},
		/**
		 * Return slice of the collection, use native Array.slice arguments
		 * 
		 * @returns {Array}
		 */
		slice: function() {
			return this.models.slice.apply(this.models, arguments);
		},
		/**
		 * Iterates over all models, each model is passed into the callback as a first argument, second argument is it's index within the collection
		 * 
		 * @param {Function} callback
		 * @param {Object} scope
		 */
		each: function(callback, scope) {
			for(var i in this.models){
				if(this.models.hasOwnProperty(i)){
					if(callback.call(scope || this, this.models[i], i) === false){
						return;
					}
				}
			}
		},
		/**
		 * Return Array of Models that match specified attributes
		 * 
		 * @param {Object} where Hash of attributes
		 * @param {Boolean} [typeSensitive=false] If TRUE, than search is done with type sensitive comparition
		 * @returns {Array}
		 */
		where: function(where, typeSensitive) {
			var models = [];
			
			this.each(function(m){
				if(m.match(where, typeSensitive)){
					models.push(m);
				}
			});
			
			return models;
		},
		/**
         * Return Array of Models that match specified attributes
		 * Same as `where` but returns only the first found Model
		 * 
		 * @param {Object} where Hash of attributes
		 * @param {Boolean} [typeSensitive=false] If TRUE, than search is done with type sensitive comparition
		 * @returns {Model}
		 */
		find: function(where, typeSensitive) {
			var model;
			
			this.each(function(m){
				if(m.match(where, typeSensitive)){
					model = m;
					return false;
				}
			});
			
			return model;
		},
		/**
		 * Fetch data from a server, returns new Promise
		 * 
		 * @template
		 * @chainable
		 * @returns {Promise}
		 */
		fetch: function(){
			
		}
	});

	return Collection;

})(Events, Deferrable, Model);