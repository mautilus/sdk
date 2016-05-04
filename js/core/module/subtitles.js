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
 * Subtitles class
 * Own implementation of subtitles independently of all platfroms
 * 
 * @author Mautilus s.r.o.
 * @class Subtitles
 * @singleton
 * @mixins Events
 */

Subtitles = (function(Events) {
	var Subtitles = {
		/**
		 * @property {Object} config General config hash
		 */
		config: null,
	};

	$.extend(true, Subtitles, Events, {
		/**
		 * Initialise Subtitles class
		 * 
		 */
		init: function(config) {
			this.configure(config);

			/**
			 * @property {Number} time Current playback time in [ms]
			 */
			this.time = 0;
			/**
			 * @property {Boolean} playing Player state
			 */
			this.playing = false;

			this.interval = null;

			this.regions = {};
			this.styles = {};
			this.subs = {};
			this.region_els = {};
			this.cellResolution = [32, 15];
			/**
			 * @property {Object} defaultStyle defined default style of subtitles
			 */
			this.defaultStyle = {
				textAlign: 'center',
				color: 'white',
				fontFamily: 'sans-serif',
				fontStyle: 'normal',
				fontWeight: 'normal',
				textDecoration: 'none',
				textShadow: '1px 1px 0 #000',
				displayAlign: 'before',
				lineHeight: '135%'
			};

			/**
			 * @property {Object} $el Wrapper element
			 */
			this.$el = $('<div id="subtitles-wrap" />').appendTo('body');

			this.$el.css({
				position: 'absolute',
				zIndex: 0,
				top: 0,
				left: 0,
				width: 1280,
				height: 720
			}).hide();

			Player.on('timeupdate', function(time) {
				if (!this.subs) {
					return;
				}

				this.setTime(parseFloat(time));
			}, this);

			Player.on('stop', function() {
				this.stop();
			}, this);

			Player.on('end', function() {
				this.stop();
			}, this);

			Player.on('show', function() {
				this.show();
			}, this);

			Player.on('hide', function() {
				this.hide();
			}, this);

			Player.on('statechange', function(state) {
				if (state === Player.STATE_PLAYING) {
					this.playing = true;

				} else {
					this.playing = false;
				}
			}, this);
		},

		/**
		 * Set class config hash
		 * 
		 * @param {Object} config Hash of parameters
		 */
		configure: function(config) {
			this.config = $.extend(true, this.config || {}, config);
		},

		/**
         * Internal player timer
		 * @private
		 */
		tick: function() {
			if (this.playing) {
				this.setTime(this.time + 100);
			}
		},

		/**
         * Time updating inside this class and call rendering function
		 * @private
		 */
		setTime: function(time) {
			this.time = time;
			this.render();
		},

		/**
		 * Set TTML xml subtitles
         * Parsing subtitles, start and end time, getting lines in each subtitle, get and prepare style of each subtitle
         * and filling-in private attributes for rendering subtitles
		 * 
		 * @param {String} xml XML file
		 * @param {Number} [timeOffset=0] Time offset in [ms]
		 */
		setTTML: function(xml, timeOffset) {
			var scope = this, subs = {}, regions = {}, styles = {}, body, head, region, cellResolution, bodyStyles, isFirstStyle = true,
				rgba, getTime, getLines, getStyleAttrs, xml2html;
			
			xml = (typeof xml === 'string' ? $.parseXML(xml) : xml);

			rgba = function(color) {
				var m;
				if (String(color).match(/^\#\w{8}/)) {
					m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(\d+)$/i.exec(color);
					return 'rgba(' + parseInt(m[1], 16) + ', ' + parseInt(m[2], 16) + ', ' + parseInt(m[3], 16) + ', ' + (parseInt(m[4], 10) / 100) + ')';
				}

				return color;
			};

			getTime = function(str, offset) {
				var t, p;

				if (!str) {
					return null;
				}

				if (str.match(/s$/)) {
					t = parseFloat(str) * 1000;

				} else {
					p = String(str).split(/\,|\.|\:/);
					t = Math.round(((parseInt(p[0], 10) * 3600000) + (parseInt(p[1], 10) * 60000) + (parseInt(p[2], 10) * 1000) + parseInt(p[3], 10)));
				}

				if (offset) {
					t += offset;
				}

				return t;
			};

			getLines = function(str) {
				var lines = [];
				var parts = String(str).replace(/^\r?\n|\r?\n$/mg, '').split(/\r?\n|\<br\s?\/\>/);
				for (var i in parts) {
					if (parts[i]) {
						parts[i] = parts[i].replace(/^\s+|\s+$/g, '');

						if (parts[i]) {
							lines.push(parts[i]);
						}
					}
				}
				return lines;
			};

			getStyleAttrs = function(el, extend) {
				if (extend === true) {
					extend = {};
					el.find('*').each(function() {
					extend = getStyleAttrs($(this), extend);
					});
				}

				return $.extend({}, extend, {
					padding: el.attr('tts:padding') || undefined,
					margin: el.attr('tts:margin') || undefined,
					color: rgba(el.attr('tts:color')) || undefined,
					fontSize: el.attr('tts:fontSize') || undefined,
					fontFamily: el.attr('tts:fontFamily') || undefined,
					fontStyle: el.attr('tts:fontStyle') || undefined,
					fontWeight: el.attr('tts:fontWeight') || undefined,
					textDecoration: el.attr('tts:textDecoration') || undefined,
					textAlign: el.attr('tts:textAlign') || undefined,
					backgroundColor: rgba(el.attr('tts:backgroundColor')) || undefined,
					displayAlign: el.attr('tts:displayAlign') || undefined
				});
			};

			xml2html = function(el) {
				var html = '';
				var tmpel, tmpwrap = $('<div />');
				el = el[0];

				for (var i in el.childNodes) {
					if (!el.childNodes[i] || !el.childNodes[i].nodeType) {
					continue;
					}

					if (el.childNodes[i].tagName === 'span') {
					tmpwrap.empty();
					tmpel = $('<span />');
					tmpel.text(el.childNodes[i].textContent);

					tmpel.css(getStyleAttrs($(el.childNodes[i])));
					tmpwrap.append(tmpel);
					html += tmpwrap.html();

					} else if (el.childNodes[i].tagName === 'br') {
					html += '<br/>';

					} else {
					html += el.childNodes[i].nodeValue;
					}
				}

				return html;
			};

			xml = $(xml);
			head = xml.find('head');
			body = xml.find('body');
			bodyStyles = getStyleAttrs(body);
			region = body.attr('region') || body.find('div:first').attr('region') || null;
			cellResolution = xml.find('tt').attr('ttp:cellResolution');

			head.find('styling').find('style').each(function(i, s) {
				var id, style;
				s = $(s);

				if ((id = s.attr('xml:id')) || (id = s.attr('id'))) {
					style = s.attr('style') || s.attr('tts:style');

					styles[id] = {
						id: id,
						origin: s.attr('tts:origin') || (style ? styles[style].origin : null),
						extent: s.attr('tts:extent') || (style ? styles[style].extent : null),
						css: getStyleAttrs(s, (style ? (styles[style].css || {}) : {}))
					};

					if (isFirstStyle) {
						scope.defaultStyle = $.extend(scope.defaultStyle, styles[id].css);
					}

					isFirstStyle = false;
				}
			});

			head.find('region').each(function(i, r) {
				var id, extent, origin, styleId, style;
				r = $(r);

				var findStyle = function(attr) {
					var v;
					r.find('tts:style').each(function(i, s) {
						if ($(s).attr(attr)) {
							v = $(s).attr(attr);
						}
					});
					return v;
				}

				if ((id = r.attr('xml:id')) || (id = r.attr('id'))) {
					styleId = r.attr('style') || r.attr('tts:style') || null;
					style = styles[styleId];
					extent = String(r.attr('tts:extent') || findStyle('tts:extent') || (style && style.extent)).split(/\s+/);
					origin = String(r.attr('tts:origin') || findStyle('tts:origin') || (style && style.origin)).split(/\s+/);

					if (!region) {
						region = id;
					}

					regions[id] = {
						id: id,
						style: styleId,
						top: (origin && origin[1]) ? origin[1] : 0,
						left: (origin && origin[0] && origin[0] !== 'undefined') ? origin[0] : 0,
						width: (extent && extent[0] && extent[0] !== 'undefined') ? extent[0] : 'auto',
						height: (extent && extent[1]) ? extent[1] : 'auto',
						css: getStyleAttrs(r, true)
					};
				}
			});

			body.find('p').each(function(i, p) {
				p = $(p);
				var start = getTime(p.attr('tts:begin'), timeOffset);
				var reg = p.attr('tts:region');
				var parentStyles = getStyleAttrs(p.parent(), bodyStyles);

				if (!reg) {
					reg = p.parent().attr('tts:region');
				}

				if (!subs[start]) {
					subs[start] = [];
				}

				subs[start].push({
					start: start,
					end: getTime(p.attr('tts:end'), timeOffset),
					style: p.attr('tts:style') || null,
					region: reg || region || 'default',
					lines: getLines(xml2html(p)),
					css: getStyleAttrs(p, parentStyles)
				});
			});

			if (!regions || $.isEmptyObject(regions)) {
				regions['default'] = {
					id: 'default',
					style: null,
					top: '85%',
					left: '5%',
					width: '90%',
					height: 'auto',
					css: {}
				};
			}

			if (cellResolution) {
				scope.cellResolution = String(cellResolution || '32 15').split(/\s+/);
			}

			scope.regions = $.extend(true, this.regions, regions);
			scope.styles = $.extend(true, this.styles, styles);
			scope.subs = $.extend(true, this.subs, subs);
		},

		/**
		 * Set SRT subtitles
		 * 
		 * example: https://www.npmjs.com/package/subtitles-parser
		 * example: https://raw.githubusercontent.com/bazh/subtitles-parser/master/index.js
		 * license: MIT
		 * 
		 * @param {String} subtitles
		 */
		setSRT: function(srt) {
			/**
			 * Time to miliseconds
			 * 
			 * @param {String} time value
			 * @return {Number} miliseconds
			 */
			var timeMs = function(val) {
				var regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
		        var parts = regex.exec(val);

		        if (parts === null) {
		            return 0;
		        }

		        for (var i = 1; i < 5; i++) {
		            parts[i] = parseInt(parts[i], 10);
		            if (isNaN(parts[i])) parts[i] = 0;
		        }

		        // hours + minutes + seconds + ms
		        return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4];
		    };

		    /**
		     * From Srt parser
		     * 
		     * @param {String} srt data
		     * @param {Boolean} ms true = use miliseconds
		     * @return {Object} items [{{String} id,
		     * 							{String} startTime,
		     * 							{String} endTime,
		     * 							{String} text }]
		     * 
		     */
		    var fromSrt = function(data, ms) {
		    	var useMs = ms ? true : false;

		        data = data.replace(/\r/g, '');
		        var regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
		        data = data.split(regex);
		        data.shift();

		        var items = [];
		        for (var i = 0; i < data.length; i += 4) {
		            items.push({
		                id: data[i].trim(), // {String}
		                startTime: useMs ? timeMs(data[i + 1].trim()) : data[i + 1].trim(), // {String}
		                endTime: useMs ? timeMs(data[i + 2].trim()) : data[i + 2].trim(), // {String}
		                text: data[i + 3].trim() // {String}
		            });
		        }

		        return items;
		    };

		    // RUN
		    this.subs = {};
		    if(srt) {
		    	var items = fromSrt(srt, true);
		    	for(var i=0; i<items.length; i++) {
		    		this.subs[items[i].startTime] = items[i];
		    	}
		    }

		},

		/**
		 * Start playback in given format
		 * 
		 * @param {String} format `ttml`, `srt`
		 * @param {Object/String} [data] XML or SRT data
		 */
		play: function(format, data) {
			var scope = this;

			this.playing = true;
			this.setTime(0);
			this.subsFormat = format;

			if (this.interval) {
				clearInterval(this.interval);
			}

			if (format === 'ttml' && data) {
				this.setTTML(data);
			} else if (format === "srt" && data) { /* for srt are data url (http:/... movie.srt) */
				this.setSRT(data);
			}

			this.interval = setInterval(function() {
				scope.tick();
			}, 100);
		},

		/**
		 * Stop playback and clear data
		 */
		stop: function() {
			this.playing = false;

			this.regions = {};
			this.styles = {};
			this.subs = {};
			this.region_els = {};
			this.setTime(0);
			
			this.$el.empty();

			if (this.interval) {
				clearInterval(this.interval);
			}
		},

		/**
         * Update layout of subtitles related with player size
		 * @private
		 */
		show: function() {
			this.isVisible = true;

			this.$el.css({
				width: Player.width,
				height: Player.height,
				left: Player.left,
				top: Player.top
			}).show();
		},

		/**
         * Hide subtitles
		 * @private
		 */
		hide: function() {
			this.isVisible = false;

			this.$el.hide();
		},

		/**
		 * @private
		 */
		style2css: function(style) {
			if (style.fontFamily) {
				switch (style.fontFamily) {
					case 'default':
					case 'sansSerif':
					case 'monospaceSansSerif':
					case 'proportionalSansSerif':
						style.fontFamily = 'sans-serif';
						break;
					case 'serif':
					case 'monospaceSerif':
					case 'proportionalSerif':
						style.fontFamily = 'serif';
						break;
				}
			}

			if (style.fontSize && style.fontSize.match(/px/)) {
				style.fontSize = (parseInt(style.fontSize) + 4) + 'px';
			}
			
			if (style.backgroundColor) {
				style.backgroundColor = 'rgba(0,0,0,0.6)';
			}

			return style;
		},

		/**
         * Get time when subtitles should be hidden
		 * @private
		 */
		getMaxEndTime: function(arr) {
			var times = [];
			for (var i in arr) {
				times.push(parseInt(arr[i].end, 10));
			}
			return (times.sort().reverse())[0];
		},

		/**
         * Prepare CSS style for subtitle
		 * @private
         * @param {Object} css style from received subtitle file related with concrete subtitle string
         * @param {Object} [cssOverride] css which shoud overwrite css properties
         * @returns {Object} with css style 
		 */
		getStyles: function(css, cssOverride) {
			var o = $.extend({}, this.defaultStyle);
			for (var i in css) {
				if (css[i] !== undefined) {
					o[i] = css[i];
				}
			}

			$.extend(o, cssOverride || {});

			return this.style2css(o);
		},

		/**
         * Render region. It is required for subtitle rendering
		 * @private
         * @param {Object} regionId id which region be rendered
         * @returns {Object} jQuery element (region)
		 */
		renderRegion: function(regionId) {
			var $el, $wrap, cells2px, colWidth, rowHeight;

			if (!this.regions[regionId]) {
				return false;
			}

			colWidth = parseInt(this.$el.width()) / parseInt(this.cellResolution[0]);
			rowHeight = parseInt(this.$el.height()) / parseInt(this.cellResolution[1]);

			cells2px = function(cells, rows) {
				var px;
				if (String(cells).match(/c$/)) {
					px = parseInt(cells, 10) * (rows ? rowHeight : colWidth);
					return px + 'px';
				}

				return cells;
			}

			$el = $('<div id="subtitleRegion-' + this.regions[regionId].id + '" />');
			$wrap = $('<div />').appendTo($el);
			$el.appendTo(this.$el);

			$el.css({
				position: 'absolute',
				textAlign: 'center',
				width: cells2px(this.regions[regionId].width),
				height: cells2px(this.regions[regionId].height, true),
				left: cells2px(this.regions[regionId].left),
				top: cells2px(this.regions[regionId].top, true)
			});

			$el.css(this.regions[regionId].css || {});

			if (this.regions[regionId].css.displayAlign === 'after') {
				$wrap.css({
					position: 'absolute',
					width: '100%',
					bottom: 0
				});

			} else if (this.regions[regionId].css.displayAlign === 'center') {
				var half = (parseInt(cells2px(this.regions[regionId].height, true)) / 2);
				$wrap.css({
					position: 'absolute',
					width: cells2px(this.regions[regionId].width),
					top: half + 'px',
					marginTop: (-1 * (half / 2)) + 'px'
				});
			}

			this.region_els[this.regions[regionId].id] = $wrap;

			return $wrap;
		},

		/**
         * render subtitle related with current playing time
		 * @private
		 */
		render: function() {
			var $el, $wrap;

			if (!this.$el || !this.isVisible) {
			return;
			}

			if(this.subsFormat == 'ttml') {
				for (var i in this.subs) {
					if (this.time >= parseInt(i, 10) && this.getMaxEndTime(this.subs[i]) >= this.time) {
						if (this.lastRenderedTime !== i) {
							this.lastRenderedTime = i;
	
							if (this.subs[i]) {
								for (var j in this.subs[i]) {
									$wrap = this.region_els[this.subs[i][j].region];
	
									if (!$wrap) {
										$wrap = this.renderRegion(this.subs[i][j].region);
									}
	
									if (!$wrap) {
										break;
									}
	
									$wrap.empty();
									$el = $('<div />');
									$el.html(this.subs[i][j].lines.join('<br />'));
	
									$el.css({
										display: 'inline-block',
										padding: '5px 10px'
									});
	
									$el.css(this.getStyles((this.subs[i][j].style && this.styles[this.subs[i][j].style]) ? this.styles[this.subs[i][j].style].css : {}, this.subs[i][j].css));
	
									$wrap.append($el);
								}
							}
						}
	
						return;
					}
				}

				if (this.lastRenderedTime !== false) {
					this.lastRenderedTime = false;
	
					for (var i in this.region_els) {
						if (this.region_els.hasOwnProperty(i)) {
						this.region_els[i].empty();
						}
					}
				}
			} else if(this.subsFormat == 'srt') {
				/*
				 subs[i] = {
				 	id
		          	startTime
		          	endTime
		          	text
		         }
		         */
				for (var i in this.subs) {
	            	if (this.time >= i && this.subs[i].endTime >= this.time) {
	                    if (this.lastRenderedTime !== i) {
	                        this.lastRenderedTime = i;
	                        if (this.subs[i]) {
	                            this.$el.html(this.subs[i].text);
	                            console.log('subtitles: ' + this.subs[i].text);
	                        }
	                    } else if(this.subs[i].endTime < this.time + 100) {
	                    	this.$el.empty();
	                    }
	                    
	                    return;
	                }
	            }
			}
		}
	});

	// Initialize this class when Main is ready
	Main.ready(function() {
		Subtitles.init();
	});

	return Subtitles;

})(Events);