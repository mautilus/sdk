/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Playready class
 * 
 * @author Mautilus s.r.o.
 * @class Playready
 * @mixins Events
 * @mixins Deferrable
 */

Playready = (function(Events, Deferrable) {
	var Playready = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Playready.prototype, Events, Deferrable, {
		/**
		 * Construct object
		 * 
		 * @param {String} manifest Manifest URL address
		 * @constructor
		 */
		construct: function(manifest) {
			this.ready = false;
			this.manifest = manifest;
		},
		/**
		 * Destruct object
		 * 
		 * @private
		 */
		desctruct: function() {
			
		},
		/**
		 * @private
		 */
		setStreams: function(streams){
			this.streams = streams || [];
		},
		/**
		 * Get one stream by its type
		 * 
		 * @param {String} type
		 * @param {String} [name]
		 * @param {String} [language]
		 */
		getStream: function(type, name, language){
			for(var i in this.streams){
				if(this.streams[i] && this.streams[i].type === type && ((language && this.streams[i].language === language)) || (name && this.streams[i].name === name)){
					return this.streams[i];
				}
			}
			
			return false;
		},
		/**
		 * Get array of streams by type, name or language
		 * 
		 * @param {String} type
		 */
		getStreams: function(type){
			var streams = [];

			for(var i in this.streams){
				if(this.streams[i] && this.streams[i].type === type){
					streams.push(this.streams[i]);
				}
			}
			
			return streams;
		},
		/**
		 * Get subtitles
		 * 
		 * @param {String} language
		 * @param {Function} callback
		 * @param {Object} cbscope
		 */
		getSubtitles: function(language, callback, cbscope){
			var scope = this, stream = this.getStream('text', language), t = 0;
			
			if(stream){
				this.subtitles = {};
				
				if(stream.cs){
					for(var i in stream.cs){
						if(stream.cs[i]){
							if(stream.cs[i].t && ! stream.cs[i].d){
								t = parseInt(stream.cs[i].t);
							}
								
							Ajax.request(stream.url.replace(/\{bitrate\}/ig, stream.bitrate).replace(/\{start time\}/ig, t)).done((function(t){
								return function(resp){
									if(callback){
									callback.call(cbscope || scope, scope.fixTTML(resp), t / 10000);
									}
								};
							})(t));
								
							if(stream.cs[i].d){
								t += parseInt(stream.cs[i].d);
							}
						}
					}
				}
			}
		},
		/**
		 * @private
		 */
		fixTTML: function(ttml){
			ttml = ttml
			.replace(/^[^\<]+/, '')
			.replace(/\sp\d+\:/g, ' tts:')
			.replace(/\sxmlns\:p[45]/g, ' xmlns:tts');

			return ttml;
		},
		/**
		 * Fetch manifest
		 */
		fetch: function(){
			var base = String(this.manifest).replace(/\/manifest$/i, '/');
			
			return Ajax.request(this.manifest, {type: 'xml'}).done(function(xml){
				var streams = [], scope = this;
				
				if(xml){
					xml = $(xml);
					
					xml.find('StreamIndex').each(function(){
						var stream = $(this), qLevel, cs = [];
						
						if(stream.attr('QualityLevels') == 1){
							qLevel = stream.find('QualityLevel').eq(0);
							
							if(stream.attr('Type') === 'text'){
								stream.find('c').each(function(){
									var c = $(this);
									
									cs.push({
									t: c.attr('t') || '',
									n: c.attr('n'),
									d: c.attr('d') || ''
									});
								});
							}
						}
						
						streams.push({
							index: streams.length,
							type: stream.attr('Type') || '',
							subtype: stream.attr('Subtype') || '',
							language: stream.attr('Language') || '',
							name: stream.attr('Name') || '',
							url: stream.attr('Url') ? base+stream.attr('Url') : '',
							bitrate: qLevel ? qLevel.attr('Bitrate') : '',
							fourCC: qLevel ? qLevel.attr('FourCC') : '',
							cs: cs
						});
					});
					
					scope.setStreams(streams);
					scope.ready = true;
				}
			}, this);
		}
	});

	return Playready;

})(Events, Deferrable);