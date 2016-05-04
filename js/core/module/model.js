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
 * Model abstract class
 * 
 * @author Mautilus s.r.o.
 * @class Model
 * @abstract
 * @mixins Events
 * @mixins Deferrable
 */

Model = (function(Events, Deferrable) {

	var Model = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Model.prototype, Events, Deferrable, {
        /**
         * @property {Object} attributes attributes related to model 
         */

		/**
		 * Construct Model object.
		 * 
         * @param {Object} [attributes] attributes which be set in model
		 * @constructor
		 */
		construct: function(attributes) {
			this.clear();
			this.set(attributes);
		},
		/**
		 * Destruct object and remove model attributes 
		 * 
		 * @private
		 */
		desctruct: function() {
			this.clear();
		},
		/**
		 * Set a hash of attributes
		 * 
		 * @param {Object} attributes
		 */
		set: function(attributes, value){
			var n;
			
			if(typeof attributes === 'string'){
				n = {};
				n[attributes] = value;
				return this.set(n);
			}
			
			for(var i in attributes){
				if(attributes.hasOwnProperty(i)){
					n = String(i).toUpperCase().substr(0, 1)+String(i).substr(1);
					
					if(typeof this['set'+n] === 'function'){
						this['set'+n].call(this, attributes[i]); 
					
					}else{
						this.attributes[i] = attributes[i];
					}
					
					this.trigger('set', i, this.attributes[i]);
				}
			}
		},
		/**
		 * Get the value of specified attribute
		 * 
		 * @param {String} attribute
		 */
		get: function(attribute){
			var n = String(attribute).toUpperCase().substr(0, 1)+String(attribute).substr(1);
			
			if(typeof this['get'+n] === 'function'){
				return this['get'+n].call(this); 
			}
			
			return this.attributes[attribute];
		},
		/**
		 * Check if specified attribute is set and not empty (non-null or non-undefined)
		 * 
		 * @param {String} attribute
		 * @returns {Boolean}
		 */
		has: function(attribute){
			return (this.attributes[attribute] ? true : false);
		},
		/**
		 * Removes all attributes
         * 
         * @fires clear
		 */
		clear: function(){
			this.attributes = {};
			
			this.trigger('clear');
		},
		/**
		 * Compare Model with specified hash and return TRUE if all attributes match
		 * 
		 * @param {Object} attributes Hash of attributes
		 * @param {Boolean} [typeSensitive=false] TRUE for type sensitive comparition
		 * @returns {Boolean} TRUE if match FALSE if not match
		 */
		match: function(attributes, typeSensitive){
			for(var i in attributes){
				if(attributes.hasOwnProperty(i)){
					if(! typeSensitive && attributes[i] != this.get(i)){
						return false;
					
					}else if(typeSensitive && attributes[i] !== this.get(i)){
						return false;
					}
				}
			}
			
			return true;
		},
		/**
		 * Clone model
		 * 
		 * @returns {Model}
		 */
		clone: function(){
			var obj = {};
			
			for(var i in this){
				obj[i] = this[i];
			}
			
			return obj;
		}
	});

	return Model;

})(Events, Deferrable);