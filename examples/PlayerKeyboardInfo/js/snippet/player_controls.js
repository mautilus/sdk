/**
 * Player controls
 * 
 * Parent: [Scene_VideoPlayer]
 * 
 * @author Mautilus s.r.o.
 * @class Snippet_PlayerControls
 * @extends Snippet
 */

Snippet_PlayerControls = (function(Snippet) {

	var Snippet_PlayerControls = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Snippet_PlayerControls.prototype, Snippet.prototype, {
		/**
		 * @inheritdoc Snippet#init
		 */
		init: function() {
			var scope = this;
			this.name = 'snippet-player-controls';

			// elements
			this.$play = $('.play', this.$el);
			this.$fwd = $('.fwd', this.$el);
			this.$rwd = $('.rwd', this.$el);

			// init
			if (!this.inited) {
				this.inited = true;

				// Player events
				Player.on('statechange', function(state) {
					if (state === Player.STATE_PAUSED) {
						// FWD disable focus
						this.$fwd.removeClass('focus');
						this.$fwd.removeClass('focusable');
						this.$fwd.addClass('disable');
						// RWD disable focus
						this.$rwd.removeClass('focus');
						this.$rwd.removeClass('focusable');
						this.$rwd.addClass('disable');
					} else {
						// FWD enable focus
						this.$fwd.removeClass('disable');
						this.$fwd.addClass('focusable');
						// RWD enable focus
						this.$rwd.addClass('focusable');
						this.$rwd.removeClass('disable');
					}
				}, this);

				// Key events
				this.on('key', function(keyCode) {
					if (keyCode === Control.key.LEFT && this.$el.css('display') === 'none') {
						this.show();
						return false;
					} else if (keyCode === Control.key.RIGHT && this.$el.css('display') === 'none') {
						this.show();
						return false;
					} else if (keyCode === Control.key.UP && this.$el.css('display') === 'none') {
						this.show();
						return false;
					} else if (keyCode === Control.key.DOWN && this.$el.css('display') === 'none') {
						this.show();
						return false;
					} else if (keyCode === Control.key.ENTER && this.$el.css('display') === 'none') {
						this.show();
						return false;
					}
					this.show();
				}, this);

				// Show events
				this.on('show', function() {
					this.uiVisible = true;
					if (!this.parent.$el.hasClass('ui-visible')) {
						this.parent.$el.addClass('ui-visible');
						this.focus();
					}

					if (this.controls_timer) {
						clearTimeout(this.controls_timer);
					}

					this.controls_timer = setTimeout(function() {
						scope.hide();
					}, 10000);
				}, this);

				// Hide events
				this.on('hide', function() {
					if (Player.getState() === Player.STATE_PAUSED) {
						return;
					}
					if (!this.uiVisible) return;

					this.uiVisible = false;
					this.parent.$el.removeClass('ui-visible');

					if (this.controls_timer) {
						clearTimeout(this.controls_timer);
					}
				}, this);
			}
		},

		/**
		 * @inheritdoc Snippet#create
		 */
		create: function() {
			return $('#snippet-player-controls', this.parent.$el);
		},

		/**
		 * @inheritdoc Snippet#render
		 * Render the list of tabs on welcome scene.
		 */
		render: function() {
			return this.when(function(promise) {
				promise.resolve();
			}, this);
		},

		/**
		 * @inheritdoc Snippet#focus
		 */
		focus: function() {
			Focus.to($('.play'), this.$el);
		},

		/**
		 * @inheritdoc Snippet#navigate
		 * Handle navigation within the snippet
		 */
		navigate: function(direction, stop) {
			stop();

			if (direction == 'left') {
				Focus.to(this.getFocusable(-1, true));
			} else if (direction == 'right') {
				Focus.to(this.getFocusable(1, true));
			} else if (direction == 'up') {
				// ...
			} else if (direction == 'down') {
				// ...
			}
		},

		/**
		 * @inheritdoc Snippet#onClick
		 * Call onEnter() on focused element
		 */
		onClick: function($el,e,stop) {
			stop();
			this.onEnter($el,e,stop);
		 },

		/**
		 * Event called after Enter is pressed
		 * @param {Object} $el jQuery object of element on enter was triggered
		 * @param {Object} e HTML event
		 * @param {Function} stop Stop function 
		 */
		onEnter: function($el,e,stop) {
			stop();
			var value = $el.attr('data-value');

			switch(value) {
				case 'play':
					if ((Player.currentState === Player.STATE_PLAYING) && (Player.currentTime > 0)) {
						this.parent.pause();
					} else if ((Player.currentState === Player.STATE_PAUSED) && (Player.currentTime > 0)) {
						this.parent.play();
					} else if ((Player.currentState !== Player.STATE_PLAYING)) {
						this.parent.play(this.parent.video);
					}
					break;
				case 'fwd':
					if (Player.currentState === Player.STATE_PLAYING) {
						this.parent.forward();
					}
					break;
				case 'rwd':
					if (Player.currentState === Player.STATE_PLAYING) {
						this.parent.backward();
					}
					break;
			}
		},

		/**
		 * @inheritdoc Snippet#onFocus
		 * Call on focused element
		 * @param {Object} $el jQuery object of element which focused
		 */
		onFocus: function($el) {
			// default trigger
			this.trigger('focus', $el);
		},
	});

	return Snippet_PlayerControls;

})(Snippet);