/**
 * Channels
 * 
 * @author Mautilus s.r.o.
 * @class Snippet_Channels
 * @extends Snippet
 */
Snippet_Channels = (function(Snippet) {

	var Snippet_Channels = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Snippet_Channels.prototype, Snippet.prototype, {
		init: function() {
			// get template
			this.tplChannel = $('#tpl-channel').html();

			this.on('focus', function($el) {
				this.onChange($el);
			}, this);
		},

		/**
		 * @inheritdoc Snippet#create
		 */
		create: function() {
			return $('<div id="channels" />');
		},

		/**
		 * @inheritdoc Snippet#render
		 */
		render: function() {
			this.$el.empty();
			this.$elUl = $('<ul />').appendTo(this.$el);

			this.renderItems();
		},

		/**
		 * @private
		 */
		renderItems: function() {
			var scope = this,
				renderItem;

			this.$elUl.empty();

			renderItem = function(data) {
				return Mustache.render(scope.tplChannel, data);
			};

			if (this.config.collection) {
				this.config.collection.each(function(model, i) {
					this.$elUl.append(renderItem(model.attributes));
				}, this);
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
			var active = this.$el.find('.active');

			if (active && active.length) {
				return Focus.to(active);
			}

			return Focus.to(this.getFocusable(0, true));
		},

		/*
		 * @private
		 */
		onChange: function($el) {
			var id = $el.attr('data-id');

			if (this.activeId === id) {
				return;
			}

			this.activeId = id;

			this.$el.find('.active').not($el).removeClass('active');
			$el.addClass('active');

			if (this.trigger('change', $el, id) === false) {
				return false;
			}
		}
	});

	return Snippet_Channels;

})(Snippet);