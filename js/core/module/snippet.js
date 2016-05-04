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
 * Snippet abstract class for each visual components. It is recommended to use this abstract class for carousels, grids etc.
 * 
 * @author Mautilus s.r.o.
 * @class Snippet
 * @abstract
 * @mixins Events
 * @mixins Deferrable
 */

Snippet = (function (Events, Deferrable) {
    var Snippet = function () {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Snippet.prototype, Events, Deferrable, {
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
		 * @property {Array} eventsArray array of events for unbind
         * @private
		 */

        /**
         * @property {Object} $el snippet's element, jQuery collection
         */

        /**
         * @property {Object} parent Parent snippet or scene
         */

        /**
         * @property {Boolean} isVisible Whether snippet is visible or not
         */

		/**
		 * Construct object
         * Configuration and initialization of snippet and snippet events 
		 * 
		 * @constructor
		 * @param {Object} [parent=null] Scene or Snippet this snippet belongs to
		 * @param {Object} [config={}] Config
		 */
        construct: function (parent, config) {
            if (typeof config === 'undefined' && parent && !parent.construct) {
                // scene is not provided, but config is
                config = $.extend(true, {}, parent);
                parent = null;
            }

            this.parent = parent;
            this.isVisible = false;

            this.configure(config);


            this.$el = this.create();

            this.init.call(this, parent, config);
            this.initEvents();
            this.onLangChange(true, I18n.locale);
        },
		/**
		 * Destruct object. It means calling deinitialization and destroying functions
		 * 
		 * @private
		 */
        desctruct: function () {
            this.deinit.apply(this, arguments);
            this.destroy();
        },
		/**
		 * Bind listeners to the `key` event and some others
         * Mouse (MRCU or some other "mouse" remote controllers) events (click or scroll) is binding here.  
		 * 
		 * @private
		 */
        initEvents: function () {
            var _click, _scroll, _focus, _langchange;

            _click = function ($el) {
                if (!$el.belongsTo(this.$el)) {
                    return;
                }

                return this.onClick.apply(this, arguments);
            };

            _scroll = function ($el) {
                if (!$el.belongsTo(this.$el)) {
                    return;
                }

                return this.onScroll.apply(this, arguments);
            };

            _focus = function ($el) {
                if (!$el.belongsTo(this.$el)) {
                    return;
                }

                return this.onFocus.apply(this, arguments);
            };

            _langchange = function () {
                this.onLangChange.apply(this, arguments);
            };

            if (this.parent) {
                this.parent.on('key', this.onKeyDown, this);
                this.parent.on('click', _click, this);
                this.parent.on('scroll', _scroll, this);

            } else {
                Control.on('key', this.onKeyDown, this);
                Mouse.on('click', _click, this);
                Mouse.on('scroll', _scroll, this);
            }

            // register of focus event
            Focus.on('focus', _focus, this);
			
            // register of langchange event
            I18n.on('langchange', _langchange, this);

            // set array of events for unbind
            this.eventsArray = [_click, _scroll, _focus, _langchange];
        },
		/**
		 * This method is called every time, when the language of application is changed.
		 * For change language, you gotta call function I18n.changeLanguage()
		 *
		 * @template
		 * @param {Boolean} firstTime
		 * @param {String} langCode
		 * 
		 */
        onLangChange: function (firstTime, langCode) {

        },
		/**
		 * Unbind all events.
		 */
        unbindEvents: function () {
            Control.off('key', this.onKeyDown, this);
            Mouse.off('click', this.eventsArray[0], this);
            Mouse.off('scroll', this.eventsArray[1], this);
            Focus.off('focus', this.eventsArray[2], this);
            I18n.off('langchange', this.eventsArray[3], this);
        },
		/**
		 * Initialise snippet
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 */
        init: function () {

        },
		/**
		 * De-initialise snippet
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 */
        deinit: function () {

        },
		/**
		 * Set config params
		 * 
         * @private
		 * @returns {Object} Hash of attributes
		 */
        configure: function (config) {
            this.config = $.extend(true, this.config || {}, config);
            return this.config;
        },
		/**
		 * Set focus to the snippet
         * You can overwrite me in own snippet class
		 * 
		 * @template
         * @returns {Boolean} TRUE if snippet is focused or FALSE if not
		 */
        focus: function () {
            return Focus.to(this.getFocusable(0));
        },
		/**
		 * Render snippet
         * It is recommended to render all visual components here.
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 */
        render: function () {

        },
		/**
		 * Render snippet into specified target element
		 * 
		 * @param {Object} target jQuery collection or HTMLElement
		 */
        renderTo: function (target) {
            this.$el.appendTo(target);
            this.render();
            this.show();
        },
		/**
		 * Set snippet's element, is called if you can change snippet's element
		 * 
		 * @param {Object} element jQuery collection or HTMLElement
         * @chainable
		 * @return {Object} Snippet
		 */
        setElement: function (element) {
            this.$el = $(element);
            return this;
        },
		/**
		 * Create snippet's element, is called when snippet is being constructed
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 * @returns {Object} Element, jQuery collection
		 */
        create: function () {

        },
		/**
		 * Remove or hide snippet's element, is called when snippet is being destructed
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 */
        destroy: function () {

        },
		/**
		 * Test if this snippet has focus
		 * 
		 * @returns {Boolean} Either TRUE if snippet has focus or FALSE if snippet has no focus 
		 */
        hasFocus: function () {
            return Focus.isIn(this.$el);
        },
		/**
		 * Handles keyDown events
         * Handling is executed only when snipped has focus
         * According keyCodes here are fired right events (for navigate keys or enter event etc.) 
		 * 
		 * @private
         * @fires beforekey
         * @fires key
		 */
        onKeyDown: function (keyCode, ev, stop) {
            if (!this.hasFocus()) {
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
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 * @param {Object} $el Target element, jQuery collection
		 * @param {Event} event
		 */
        onEnter: function ($el, event) {

        },
		/**
		 * Handles RETURN event
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 * @param {Object} $el Target element, jQuery collection
		 * @param {Event} event
		 */
        onReturn: function ($el, event) {

        },
		/**
		 * Handles Click event
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 * @param {Object} $el Target element, jQuery collection
		 * @param {Event} event Mouse event
         * @fires click
		 */
        onClick: function ($el, event) {
            this.trigger('click', $el, event);
        },
		/**
		 * Handles Scroll event when snippet is focused
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 * @param {Object} $el Target element, jQuery collection
		 * @param {Number} delta, 1 or -1
		 * @param {Event} event Mouse event
         * @fires scroll
		 */
        onScroll: function ($el, delta, event) {
            this.trigger('scroll', $el, delta, event);
        },
		/**
		 * Handles Focus event
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 * @param {Object} $el Target element, jQuery collection
         * @fires focus
		 */
        onFocus: function ($el) {
            this.trigger('focus', $el);
        },
		/**
		 * Navigate in 4-way direction
         * You can overwrite me in own snippet class
		 * 
		 * @template
		 * @param {String} direction Possible values: 'left', 'right', 'up', 'down'
		 * @return {Boolean} Return FALSE to prevent event from bubeling
		 */
        navigate: function (direction) {

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
        getCircleFocusable: function (direction, parent) {
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
		 * Get all focusable elements inside this snippet
		 * 
		 * @param {Number} [index] If specified, then returns only one element at the specified position
		 * @param {Boolean} [fromCurrentlyFocused=false] If TRUE, than elements before focused element are cut off
		 * @param {Object} [$el=this.$el] Limit search for just this specified element, jQuery collection
		 * @returns {Object} jQuery collection
		 */
        getFocusable: function (index, fromCurrentlyFocused, $el) {
            var els = $('.focusable', $el || this.$el).not('.disabled').filter(':visible'), focusedIndex, _index = index;

            if (_index === 'LAST') {
                _index = els.length - 1;
            }

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
		/**
		 * Hides root element
         * @fires hide
		 */
        hide: function () {
            this.isVisible = false;
            this.$el.hide();
            this.trigger('hide');
        },
		/**
		 * Shows root element
         * @fires show
		 */
        show: function () {
            this.isVisible = true;
            this.$el.show();
            this.trigger('show');
        }

    });

    return Snippet;

})(Events, Deferrable);