/**
 * Model_Channel
 * 
 * @author Mautilus s.r.o.
 * @class Model_Channel
 * @extends Model
 */
Model_Channel = (function(Model) {

	var Model_Channel = function() {
		this.items = null;

		this.construct.apply(this, arguments);
	};

	$.extend(true, Model_Channel.prototype, Model.prototype, {
		fetch: function() {
			return Ajax.request(this.get('feed'), {
				type: 'xml'
			})
			.done(function(doc) {
				var xml = $(doc),
					scope = this;

				this.items = [];

				xml.find('item').each(function(i, item) {
					item = $(item);

					scope.items.push({
						title: item.find('title').text(),
						description: item.find('description').text().replace(/(<([^>]+)>)/ig, '').substring(0, 600),
						pubDate: item.find('pubDate').text(),
						link: item.find('link').text()
					});
				});

				this.trigger('reset');
				xml = null;

			}, this)
			.fail(function() {

			}, this);
		}
	});

	return Model_Channel;

})(Model);