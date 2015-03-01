/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Scene abstract class
 * 
 * @author Mautilus s.r.o.
 * @class Scene
 * @abstract
 * @mixins Events
 * @mixins Deferrable
 */

Scene = (function(Events, Deferrable) {

	/**
	 * @property {Object} $el Scene's element, jQuery collection
	 */
	var Scene = function() {
		this.config = {
			/**
			 * @cfg {Boolean} focusOnRender Whether call a focus method after scene is rendered
			 */
			focusOnRender: true
		};

		this.construct.apply(this, arguments);
		};

		$.extend(true, Scene.prototype, Events, Deferrable, {
		/**
		 * @event show
		 * Will be called when scene is shown
		 */

		/**
		 * @event hide
		 * Will be called when scene is hidden
		 */

		/**
		 * @event beforekey
		 * Will be called before a `key` event
		 * @preventable
		 * @param {Number} keyCode
		 * @param {Event} event
		 * @param {Function} stop
		 */

		/**
		 * @event key
		 * Will be called when a keyboard/RC event is triggered
		 * @param {Number} keyCode
		 * @param {Event} event
		 * @param {Function} stop
		 */

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
		 * @property {Boolean} isVisible TRUE, if this scene is visible
		 */

		/**
		 * @new
		 * @property {Boolean} isActive TRUE, if this scene has been activated and is visible, this property is set when an 'activate' method if successfuly executed
		 */

		/**
		 * Construct object
		 * 
		 * @constructor
		 * @param {String} name Unique name
		 * @param {Object} [config={}] Config
		 */
		construct: function(name, config) {
			if (!config && typeof name === 'object') {
			config = $.extend(true, {}, name);
			name = null;
			}

			this.name = name;
			this.resetProperties(config);

			this.$el = this.create();

			if (this.id) {
			this.$el.attr('id', this.id);
			}

			if (this.cls) {
			this.$el.addClass(this.cls);
			}

			this.init.apply(this, arguments);
			this.initEvents();
			this.onLangChange(true, I18n.locale);
		},
		/**
		 * Destruct object
		 * 
		 * @private
		 */
		desctruct: function() {
			this.deinit.apply(this, arguments);
			this.destroy();
		},
		/**
		 * @private
		 */
		resetProperties: function(config) {
			this.config = $.extend(true, this.config, config || {});
			this.id = this.config.id || null;
			this.cls = this.config.cls || null;
			this.isVisible = false;
			this.isActive = false;
		},
		/**
		 * Bind listeners to the `key` event and some others
		 * 
		 * @private
		 */
		initEvents: function() {
			Control.on('key', this.onKeyDown, this);

			if (typeof Mouse !== 'undefined') {
				Mouse.on('click', function($el) {
					if (!this.isVisible || !$el.belongsTo(this.$el)) {
					return;
				}

				return this.onClick.apply(this, arguments);
			}, this);

			Mouse.on('scroll', function($el) {
				if (!this.isVisible || !$el.belongsTo(this.$el)) {
					return;
					}

					return this.onScroll.apply(this, arguments);
				}, this);
			}

			Focus.on('focus', function($el) {
				if (!this.isVisible || !$el.belongsTo(this.$el)) {
					return;
				}

				return this.onFocus.apply(this, arguments);
			}, this);

			I18n.on('langchange', function() {
				this.onLangChange.apply(this, arguments);
			}, this);
		},
		/**
		 * This method is called every time, when the language of application is changed.
		 * For change language, you gotta call function I18n.changeLanguage()
		 *
		 * @template
		 * @param {Boolean} firstTime
		 * @param {String} langCode
		 */
		onLangChange: function(firstTime, langCode) {

		},
		/**
		 * Initialise scene
		 * 
		 * @template
		 */
		init: function() {

		},
		/**
		 * De-initialise scene
		 * 
		 * @template
		 */
		deinit: function() {

		},
		/**
		 * Set focus to the scene
		 * 
		 * @template
		 */
		focus: function() {

		},
		/**
		 * Render scene
		 * 
		 * @template
		 */
		render: function() {

		},
		/**
		 * Remove scene's elements when scene is hiding
		 * 
		 * @template
		 */
		remove: function() {

		},
		/**
		 * Create scene's element, is called when scene is being constructed
		 * 
		 * @template
		 * @returns {Object} Element, jQuery collection
		 */
		create: function() {

		},
		/**
		 * Remove or hide scene's element, is called when scene is being destructed
		 * 
		 * @template
		 * @return {Boolean/Promise} Return FALSE when you don't want to hide this scene, Promise may be also returned
		 */
		destroy: function() {

		},
		/**
		 * Activate and focus scene when its shown
		 * 
		 * @template
		 * @return {Boolean/Promise} Return FALSE when you don't want to show this scene, Promise may be also returned
		 */
		activate: function() {

		},
		/**
		 * Deactivate scene when its hidden
		 * 
		 * @template
		 * @return {Boolean} Return FALSE when you don't want to destroy this scene when its hidden 
		 */
		deactivate: function() {

		},
		/**
		 * This method is called when and 'activate' method fails
		 * 
		 * @template
		 * @new
		 * @return {Boolean} If TRUE is returned, router will call goBack (default action)
		 */
		revert: function() {
			return true;
		},
		/**
		 * Refresh is called by a Router when scene is already visible, you can call anytime you need
		 * 
		 * @template
		 */
		refresh: function() {

		},
		/**
		 * Display scene's element and set `this.isVisible` to TRUE
		 */
		show: function() {
			var args = arguments;

			return this.when(function(promise) {
			var activated;

			this.$el.show();
			this.isVisible = true;
			this.isActive = false;
			this.trigger('show');

			promise.fail(function() {
				this.hide();
			}, this);

			activated = this.activate.apply(this, args);

			if (activated instanceof Promise) {
				activated.then(function(status) {
		    var p_args = Array.prototype.slice.call(arguments, 1);	// PP!
					this.isActive = status;

					if (status) {
			    promise.resolve.apply(promise, p_args);				// PP!
					} else {
						promise.reject();
					}
				}, this);

			} else if (activated !== false) {
				this.isActive = true;
				promise.resolve();

			} else {
				this.isActive = false;
				promise.reject();
			}

			}, this);
		},
		/**
		 * Hide scene's element and set `this.isVisible` to FALSE
		 */
		hide: function() {
			return this.when(function(promise) {
			var deactivated;

			promise.done(function() {
				this.$el.hide();
				this.isVisible = false;
				this.trigger('hide');
			}, this);

			deactivated = this.deactivate();

			if (deactivated instanceof Promise) {
				deactivated.then(function(status) {
					if (status) {
						this.isActive = false;
						promise.resolve();

					} else {
						promise.reject();
					}
				}, this);

			} else if (deactivated !== false) {
				this.isActive = false;
				promise.resolve();

			} else {
				promise.reject();
			}

			}, this);
		},
		/**
		 * Test if this scene has focus (or any snippet inside this scene)
		 * 
		 * @returns {Boolean}
		 */
		hasFocus: function() {
			return Focus.isIn(this.$el);
		},
		/**
		 * Handles keyDown events
		 * 
		 * @private
		 */
		onKeyDown: function(keyCode, ev, stop) {
			if (!this.isVisible) {
				return;
			}

			if (this.trigger('beforekey', keyCode, ev) === false) {
				return false;
			}

			if (this.trigger('key', keyCode, ev) === false) {
				return false;

			} else if (keyCode === Control.key.LEFT) {
				return this.navigate('left', stop);

			} else if (keyCode === Control.key.RIGHT) {
				return this.navigate('right', stop);

			} else if (keyCode === Control.key.UP) {
				return this.navigate('up', stop);

			} else if (keyCode === Control.key.DOWN) {
				return this.navigate('down', stop);

			} else if (keyCode === Control.key.ENTER) {
				return this.onEnter(Focus.focused, ev, stop);

			} else if (keyCode === Control.key.RETURN) {
				return this.onReturn(Focus.focused, ev, stop);
			}
		},
		/**
		 * Handles ENTER event
		 * 
		 * @template
		 * @param {Object} $el Target element, jQuery collection
		 * @param {Event} event
		 */
		onEnter: function($el, event) {

		},
		/**
		 * Handles RETURN event
		 * 
		 * @template
		 * @param {Object} $el Target element, jQuery collection
		 * @param {Event} event
		 */
		onReturn: function($el, event) {

		},
		/**
		 * Handles Click event when this scene is visible
		 * 
		 * @param {Object} $el Target element, jQuery collection
		 * @param {Event} event Mouse event
		 */
		onClick: function($el, event) {
			this.trigger('click', $el, event);
		},
		/**
		 * Handles Scroll event when this scene is visible
		 * 
		 * @param {Object} $el Target element, jQuery collection
		 * @param {Number} delta, 1 or -1
		 * @param {Event} event Mouse event
		 */
		onScroll: function($el, delta, event) {
			this.trigger('scroll', $el, delta, event);
		},
		/**
		 * Handles Focus event
		 * 
		 * @template
		 * @param {Object} $el Target element, jQuery collection
		 */
		onFocus: function($el) {
			this.trigger('focus', $el);
		},
		/**
		 * Navigate in 4-way direction
		 * 
		 * @template
		 * @param {String} direction Possible values: 'left', 'right', 'up', 'down'
		 * @return {Boolean} Return FALSE to prevent event from bubeling
		 */
		navigate: function(direction) {

		},
		/**
		 * Get all focusable elements inside this snippet. This takes currentyl focused
		 * element and calculates new one. If the new sibling is not exits, new focus
		 * is getting from the start / end of collection - cyclic.
		 * 
		 * Is the same like getFocusable, but you can specify parent and also you can
		 * walkthrough all elements in cyclic.
		 * 
		 * @param {Number} direction left is equal to -1, right to 1
		 * @param {Object} parent jquery object. All focusable elements belongs only to this parent.
		 * @returns {Object} jQuery collection
		 */
		getCircleFocusable: function(direction, parent) {
			var els = $('.focusable', parent || this.$el).not('.disabled').filter(':visible'),
				focusedIndex = Focus.focused ? els.index(Focus.focused) : -1;
			if (focusedIndex != -1) {
			focusedIndex += direction;
			if (focusedIndex == -1)
				return els.eq(els.length - 1);
			else if (focusedIndex > els.length - 1)
				return els.eq(0);
			else
				return els.eq(focusedIndex);
			}
		},
		/**
		 * Get all focusable elements inside this scene
		 * 
		 * @param {Number} [index] If specified, then returns only one element at the specified position
		 * @param {Boolean} [fromCurrentlyFocused=false] If TRUE, than elements before focused element are cut off
		 * @param {Object} [$el=this.$el] Limit search for just this specified element, jQuery collection
		 * @returns {Object} jQuery collection
		 */
		getFocusable: function(index, fromCurrentlyFocused, $el) {
			var els = $('.focusable', $el || this.$el).filter(':visible').not('.disabled'), focusedIndex, _index = index;

			if (fromCurrentlyFocused) {
				focusedIndex = Focus.focused ? els.index(Focus.focused) : -1;

				if (typeof index !== 'undefined' && _index < 0) {
					els = els.slice(0, (focusedIndex >= 0 ? focusedIndex : 1));
					//_index += els.length;

				} else {
					els = els.slice(focusedIndex >= 0 ? focusedIndex : 0);
				}
			}

			if (typeof _index !== 'undefined') {
				return els.eq(_index >> 0);
			}

			return els;
		},
		/*
		 * This method is called, when you use Router.goBack on active scene, the 
		 * last scene fires this method with the name of the current scene.
		 * 
		 * @param {String} sceneName
		 */
		onBeforeGoBack: function(fromScene) {
		},
		/**
		 * Replace in-text translations date-tr="..."
		 */
		replaceI18n: function() {
			if (!this.$el) {
				return false;
			}

			this.$el.find('*[data-tr]').each(function() {
				var str;

				if (this._translated) {
					return;
				}

				for (var i in this.attributes) {
					if (this.attributes[i].name === 'data-tr') {
						str = this.attributes[i].value;
					}
				}

				if (str) {
					this.innerHTML = __(str);
					this._translated = true;
				}
			});
		}
	});

	return Scene;

})(Events, Deferrable);