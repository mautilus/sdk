/**
 * Articles
 * 
 * @author Mautilus s.r.o.
 * @class Snippet_Articles
 * @extends Snippet
 */
Snippet_Articles = (function(Snippet) {

	var Snippet_Articles = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Snippet_Articles.prototype, Snippet.prototype, {
		init: function() {
			this.buttons = new Snippet_Buttons(this);

			// get template
			this.tplArticle = $('#tpl-article').html();

			this.on('focus', function($el) {
				this.onChange($el);
			}, this);
		},

		/**
		 * @inheritdoc Snippet#create
		 */
		create: function() {
			return $('<div id="articles" />');
		},

		/**
		 * @inheritdoc Snippet#render
		 */
		render: function() {
			this.$el.empty();
			this.$elUl = $('<ul />').appendTo(this.$el);
		},

		/**
		 * @property {Model} feed Feed to render
		 */
		renderItems: function(feed) {
			var scope = this,
				renderItem;

			this.$el[0].scrollTop = 0;
			this.activeEl = null;
			this.$elUl.empty();

			renderItem = function(data) {
				return Mustache.render(scope.tplArticle, data);
			};

			for (var i in feed.items) {
				if (feed.items.hasOwnProperty(i) && feed.items[i]) {
					this.$elUl.append(renderItem(feed.items[i]));
				}
			}
		},

		/**
		 * @inheritdoc Snippet#navigate
		 */
		navigate: function(direction) {
			if (direction === 'down') {
				if (Focus.to(this.getFocusable(1, true)) === true) {
					return false;
				}

			} else if (direction === 'up') {
				if (Focus.to(this.getFocusable(-1, true)) === true) {
					return false;
				}
			}
		},

		/**
		 * @inheritdoc Snippet#focus
		 */
		focus: function() {
			if (this.activeEl) {
				return Focus.to(this.activeEl);
			}

			return Focus.to(this.getFocusable(0, true));
		},

		/*
		 * @private
		 */
		onChange: function($el) {
			var scrollTop = this.$el[0].scrollTop,
				scrollHeight = this.$el[0].clientHeight,
				offset = $el[0].offsetTop,
				height = $el[0].clientHeight;

			if (!$el.is('.article')) {
				return;
			}

			if (offset + height > scrollTop + scrollHeight) {
				this.$el[0].scrollTop = (offset + height) - scrollHeight;

			} else if (offset < scrollTop) {
				this.$el[0].scrollTop = offset;
			}
		},

		/**
		 * @inheritdoc Snippet#onEnter
		 */
		onEnter: function($el) {
			this.activeEl = $el;

			this.showButtons();
		},

		/**
		 * @inheritdoc Snippet#onClick
		 */
		onClick: function($el, event) {
			if ($el.is('.article')) {
				this.activeEl = $el;
				this.showButtons();
				return false;
			}

			this.trigger('click', $el, event);
		},

		/**
		 * Show button on active item
		 */
		showButtons: function() {
			this.buttons.renderTo(this.activeEl);
			this.buttons.focus();
		},

		/**
		 * Hide buttons
		 */
		hideButtons: function() {
			this.buttons.destroy();
			this.focus();
		},

		/**
		 * Bookmark active item
		 */
		bookmarkActive: function() {
			if (!this.activeEl) {
				return false;
			}

			this.activeEl.toggleClass('bookmark');
		},

		/**
		 * Bookmark active item
		 */
		removeActive: function() {
			var scope = this;

			if (!this.activeEl) {
				return false;
			}

			this.activeEl.fadeOut(function() {
				var next = scope.activeEl.next();
				scope.activeEl.remove();
				scope.activeEl = next;

				scope.focus();
			});
		}
	});

	return Snippet_Articles;

})(Snippet);