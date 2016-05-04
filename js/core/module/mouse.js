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
 * Handles mouse/pointer events
 * 
 * @author Mautilus s.r.o.
 * @class Mouse
 * @singleton
 * @mixins Events
 */

Mouse = (function(Events) {
	var Mouse = {
		/**
		 * @property {Object} config General config hash
		 */
		config: null,
		};

		$.extend(true, Mouse, Events, {
		/**
		 * @event click
		 * Will be called when a click event is triggered
		 * @param {Object} target Target element, jQuery colleciton
		 * @param {Event} event
		 */

		/**
		 * @event scroll
		 * Will be called when user scrolls
		 * @param {Object} target Target element, jQuery colleciton
		 * @param {Number} delta -1/+1
		 * @param {Event} event
		 */

		/**
		 * Init Mouse object
		 * @param {Object} [config={}] Mouse configuration
		 */
		init: function(config) {
			var scope = this;
			this.enabled = true;

			this.configure(config);

			jQuery(document).on('mouseenter', '.focusable', function() {
				if (typeof Focus !== 'undefined') {
					Focus.to(this);
				}
			});

			jQuery(document).on('click', '.focusable, .clickable', function(event) {
				scope.onClick(this, event);
			});

			jQuery(document).on('mousewheel', function(event) {
				var delta = event.wheelDelta || event.originalEvent.wheelDelta;
				scope.onScroll(event.target || event.originalEvent.target, delta, event);
			});
		},
		/*
		 * Enable mouse click event.
		 * 
         * @fires enable
		 */
		enable: function() {
			this.enabled = true;
			this.trigger('enable');
		},
		/*
		 * Disable mouse click event.
		 * 
         * @fires disable
		 */
		disable: function() {
			this.enabled = false;
			this.trigger('disable');
		},
		/**
		 * Set class config hash
		 * 
		 * @param {Object} config Hash of parameters
		 */
		configure: function(config) {
			this.config = $.extend(true, this.config || {}, config);
		},
		/**
		 * Handles click event
         * 
		 * @param {Object} target Target element, jQuery collection
		 * @param {Event} event Mouse event
         * @fires click
		 * @private
		 */
		onClick: function(target, event) {
			if (!this.enabled)
				return;
			target = $(target).eq(0);

			this.trigger('click', target, event);
		},
		/**
		 * Handles scroll event
		 * 
		 * @param {Object} target Target element, jQuery collection
		 * @param {Number} delat direction of scrolling
		 * @param {Event} event Mouse event
         * @fires scroll
		 * @private
		 */
		onScroll: function(target, delta, event) {
			target = $(target).eq(0);

			if (delta > 0) {
				delta = 1;

			} else {
				delta = -1;
			}

			this.trigger('scroll', target, delta, event);
		}
	});

	// Initialize this class when Main is ready
	Main.ready(function() {
		Mouse.init();
	});

	return Mouse;

})(Events);