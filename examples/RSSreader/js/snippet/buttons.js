/**
 * Buttons
 * 
 * @author Mautilus s.r.o.
 * @class Snippet_Buttons
 * @extends Snippet
 */
Snippet_Buttons = (function(Snippet) {

	var Snippet_Buttons = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Snippet_Buttons.prototype, Snippet.prototype, {
		init: function() {
			this.on('key', function(keyCode) {
				if (keyCode === Control.key.RETURN) {
					return this.onReturn();
				}
			});
		},

		/**
		 * @inheritdoc Snippet#create
		 */
		create: function() {
			return $($('#tpl-buttons').html().replace(/^\s+|\s+$/g, ''));
		},

		/**
		 * @inheritdoc Snippet#destroy
		 */
		destroy: function() {
			// detach/hide buttons
			this.$el.detach();
		},

		/**
		 * @inheritdoc Snippet#render
		 */
		render: function() {

		},

		/**
		 * @inheritdoc Snippet#navigate
		 */
		navigate: function(direction) {
			if (direction === 'right') {
				Focus.to(this.getFocusable(1, true));

			} else if (direction === 'left') {
				Focus.to(this.getFocusable(-1, true))
			}

			// block every event
			return false;
		},

		/**
		 * @inheritdoc Snippet#focus
		 */
		focus: function() {
			return Focus.to(this.getFocusable(0, true));
		},

		/**
		 * @inheritdoc Snippet#onEnter
		 */
		onEnter: function($el) {
			var btn = $el.attr('data-btn');

			if (btn === 'bookmark') {
				this.parent.bookmarkActive();
				this.parent.hideButtons();

			}
			if (btn === 'remove') {
				this.parent.removeActive();
			}

			return false;
		},

		/**
		 * @inheritdoc Snippet#onClick
		 */
		onClick: function($el, event, stop) {
			event.stopPropagation();
			return this.onEnter.apply(this, arguments);
		},

		/**
		 * @private
		 */
		onReturn: function() {
			this.parent.hideButtons();
			return false;
		}
	});

	return Snippet_Buttons;

})(Snippet);