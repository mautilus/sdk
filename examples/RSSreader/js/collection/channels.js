Collection_Channels = (function(Collection) {

	var channels = [{
			id: 1,
			name: 'engadget.com',
			feed: 'http://www.engadget.com/rss.xml'
		}, {
			id: 2,
			name: 'BBC',
			feed: 'http://feeds.bbci.co.uk/news/rss.xml'
		}];

	var Collection_Channels = function() {
		this.model = Model_Channel;

		this.construct.apply(this, arguments);

		// populate collection
		this.push(channels);
	};

	$.extend(true, Collection_Channels.prototype, Collection.prototype);

	return Collection_Channels;

})(Collection);