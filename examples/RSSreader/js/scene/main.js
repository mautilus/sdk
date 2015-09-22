/**
 * Main scene
 * 
 * @author Mautilus s.r.o.
 * @class Scene_Main
 * @extends Scene
 */
Scene_Main = (function(Scene) {

	var Scene_Main = function() {
		this.feed = null; // active feed
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Main.prototype, Scene.prototype, {
		init: function() {
			this.collectionChannels = new Collection_Channels();

			this.channels = new Snippet_Channels(this, {
				collection: this.collectionChannels
			});

			this.articles = new Snippet_Articles(this, {

			});

			this.channels.on('change', function($el, id) {
				this.loadFeed(id);
			}, this);
		},

		/**
		 * @inheritdoc Scene#create
		 */
		create: function() {
			return $('#scene-main');
		},

		/**
		 * @inheritdoc Scene#render
		 */
		render: function() {
			this.channels.renderTo(this.$el);
			this.articles.renderTo(this.$el);
		},

		/**
		 * @inheritdoc Scene#focus
		 */
		focus: function() {
			this.channels.focus();
		},

		/**
		 * @inheritdoc Scene#navigate
		 */
		navigate: function(direction) {
			if (direction === 'right') {
				this.articles.focus();

			} else if (direction === 'left') {
				this.channels.focus();
			}
		},

		renderArticles: function() {
			if (!this.feed) {
				return false;
			}

			this.articles.renderItems(this.feed);
		},

		loadFeed: function(id) {
			var feed;

			feed = this.collectionChannels.find({
				id: id
			});

			if (!feed) {
				return false;
			}

			if (this.fetchPromise && this.fetchPromise.state === this.fetchPromise.STATE_PENDING) {
				// some other feed is still fetching data, reject it
				// you will see ABORT/CANCEL network error while switching between feeds fast
				this.fetchPromise.reject();
			}

			this.feed = feed;

			this.feed.one('reset', this.renderArticles, this);

			this.fetchPromise = this.feed.fetch();
		}

	});

	return Scene_Main;

})(Scene);