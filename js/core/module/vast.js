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
 * VAST utility class for appending linear ads.
 * 
 * @author Mautilus s.r.o.
 * @class VAST
 * @singleton
 * @mixins Events
 * @mixins Deferrable
 */

VAST = (function(Events, Deferrable) {
	//Default options
	var VAST = {
		/**
		 * @property {Object} vastOptions Default VAST options for selecting ad
		 * @property {String} vastOptions.mediaType
		 * @property {Number} vastOptions.mediaBitrateMin
		 * @property {Number} vastOptions.mediaBitrateMax
		 * @property {String} vastOptions.adCaption
		 */
		vastOptions: {
			'mediaType': 'video/mp4',
			'mediaBitrateMin': 0,
			'mediaBitrateMax': 2400,
			'adCaption': 'Advertisement'
		},
		/**
		 * @property {Object} objVast for storing all VAST urls used for tracking, etc.
		 */
		objVast: {},
		/**
		 * @property {String} vastUrl containing location of VAST XML object
		 */
		vastUrl: '',
		/**
		 * @property {Object} eventsMap defining map of events used for tracking
		 */
		eventsMap: {
			'start': 'trackingStart',
			'firstQuartile': 'trackingFirstQuartile',
			'midpoint': 'trackingMidpoint',
			'thirdQuartile': 'trackingThirdQuartile',
			'mute': 'trackingMute',
			'complete': 'trackingComplete',
			'unmute': 'trackingUnmute',
			'pause': 'trackingPause',
			'resume': 'trackingResume',
			'fullscreen': 'trackingFullscreen',
			'click': 'trackingClick',
			'creativeView': 'trackingCreativeView',
			'rewind': 'trackingRewind',
			'exitFullscreen': 'trackingExitFullscreen',
			'expand': 'trackingExpand',
			'collapse': 'trackingCollapse',
			'acceptInvitation': 'trackingAcceptInvitation',
			'close': 'trackingClose',
			'progress': 'trackingProgress',
			'skip': 'trackingSkip'
		}

	};

	$.extend(true, VAST, Events, Deferrable, {
		/**
		 * Initialization of VAST class
		 * @param {String} url of VAST XML
		 * @param {Object} options 
		 * @returns {Promise}
		 */
		init: function(url, options) {
			var scope = this,
				promise = new Promise();
			if (!url.length) {
				promise.reject();
				return promise;
			}
			this.vastUrl = url;


			for (var key in options) {
				this.vastOptions[key] = options[key];
			}
			this.loadVAST(url, this.vastOptions).then(function() {
				promise.resolve();
			}).fail(function() {
				promise.reject();
			});

			this.on('onPlay', function() {
				scope.onLoad();
			});
			this.on('onEnd', function() {
				scope.onEnd();
			});
			this.on('onTimeUpdate', function(time) {
				scope.onTimeUpdate(time);
			});
			return promise;
		},

		/**
		 * Returns media url
		 *
		 * @returns {String} mediaUrl
		 */
		getMediaUrl: function() {
			return (this.objVast && this.objVast.mediaFile ? this.objVast.mediaFile :
				null);
		},

		/*
		 * Asynchronous VAST loading
		 *
		 * @param {String} url of VAST XML
		 * @param {Object} options
		 * @returns {Promise}
		 */
		loadVAST: function(url, options) {
			var scope = this,
				promise = new Promise();

			this.readVASTFile(url, options).done(function(objVast) {
				scope.objVast = objVast;
				promise.resolve();
			}).fail(function() {
				promise.reject();
			});
			return promise;
		},
		/**
		 * Gets impression from XML object.
		 *
		 * @param {Object} xmlDoc
		 * @returns {Object} impression
		 */
		getImpression: function(xmlDoc) {
			var impression = xmlDoc.find('Impression');
			return impression;
		},
		/**
		 * Gets error from XML object.
		 *
		 * @param {Object} xmlDoc
		 * @returns {Object} error
		 */
		getError: function(xmlDoc) {
			var error = xmlDoc.find('Error');
			return error;
		},
		/**
		 * Gets creatives from creative tag in XML document.
		 *
		 * @param {Object} xmlDoc
		 * @param {Object} objVast
		 * @param {Object} options
		 * @returns {Object} trackingEvents
		 */
		getCreative: function(xmlDoc, objVast, options) {
			//Get Creative
			var trackingEvents = [];
			var creative = xmlDoc.find('Creative'),
				mediaFiles = '',
				i, k;
			for (i = 0; i < creative.length; i++) {
				var creativeLinear = creative[i].getElementsByTagName('Linear');
				if (creativeLinear !== null) {
					for (var j = 0; j < creativeLinear.length; j++) {

						//Get media files
						var creativeLinearMediafiles = creativeLinear[j].getElementsByTagName(
							'MediaFiles');
						if (creativeLinearMediafiles !== null) {
							for (k = 0; k < creativeLinearMediafiles.length; k++) {
								var creativeLinearMediafilesMediafile = creativeLinearMediafiles[k]
									.getElementsByTagName('MediaFile');
								if (creativeLinearMediafilesMediafile !== null) {
									mediaFiles = creativeLinearMediafilesMediafile;
								}
							}
						}

						//Get Clickthrough URL
						var creativeLinearVideoclicks = creativeLinear[j].getElementsByTagName(
							'VideoClicks');
						if (creativeLinearVideoclicks !== null) {
							for (k = 0; k < creativeLinearVideoclicks.length; k++) {
								var creativeLinearVideoclicksClickthrough =
									creativeLinearVideoclicks[k].getElementsByTagName('ClickThrough');
								if (creativeLinearVideoclicksClickthrough) {
									creativeLinearVideoclicksClickthrough =
										creativeLinearVideoclicksClickthrough[0].childNodes[0].nodeValue;
								}
								var creativeLinearVideoclicksClickthroughTracking =
									creativeLinearVideoclicks[k].getElementsByTagName('ClickTracking');
								if (creativeLinearVideoclicksClickthrough !== null) {
									objVast.clickthroughUrl = creativeLinearVideoclicksClickthrough;
								}
								if (creativeLinearVideoclicksClickthroughTracking !== null) {
									objVast.clickthroughTracking =
										creativeLinearVideoclicksClickthroughTracking;
								}
							}
						}

						//Get Tracking Events
						var creativeLinearTrackingevents = creativeLinear[j].getElementsByTagName(
							'TrackingEvents');
						if (creativeLinearTrackingevents !== null) {
							for (k = 0; k < creativeLinearTrackingevents.length; k++) {
								var creativeLinearTrackingeventsTracking =
									creativeLinearTrackingevents[k].getElementsByTagName('Tracking');
								if (creativeLinearTrackingeventsTracking !== null) {
									trackingEvents = creativeLinearTrackingeventsTracking;
								}
							}
						}

						//Get AD Duration

						var creativeLinearDuration = creativeLinear[j].getElementsByTagName(
							'Duration')[0];
						if (creativeLinearDuration !== null) {
							objVast.duration = creativeLinearDuration.childNodes[0].nodeValue;
							var arrD = objVast.duration.split(':');
							var strSecs = (+arrD[0]) * 60 * 60 + (+arrD[1]) * 60 + (+arrD[2]);
							objVast.duration = strSecs;
						}

					}
				}
			}

			for (i = 0; i < mediaFiles.length; i++) {
				if (mediaFiles[i].getAttribute('type') === options.mediaType) {
					//if((mediaFiles[i].getAttribute('bitrate')>options.mediaBitrateMin) && (mediaFiles[i].getAttribute('bitrate')<options.mediaBitrateMax)){
					objVast.mediaFile = mediaFiles[i].childNodes[0].nodeValue;
					//}
				}
			}
			return trackingEvents;
		},
		/**
		 * Parsing of tracking events from XML VAST file to VAST object.
		 *
		 * @param {XMLString} trackingEvents VAST XML
		 * @param {Object} objVast containing VAST chunks
		 */
		getTrackingEvents: function(trackingEvents, objVast) {
			
			/**
			 * Map tracking Event to the VAST object
			 *
			 * @param  {Object} trackingEvent DOM object for getting a specific event
			 * @param  {String} attribute     type of the event
			 * @param  {String} property      used Vast property incl. type + 'Tracked' property
			 */
			var _mapVASTEvent = function(trackingEvent, attribute, property) {
				if (trackingEvent.getAttribute('event') === attribute) {
					if (objVast[property]) {
						objVast[property] += ' ' + trackingEvent.childNodes[0].nodeValue;
					} else {
						objVast[property] = trackingEvent.childNodes[0].nodeValue;
					}
					objVast[property + 'Tracked'] = false;
				}
			};
			
			//Tracking events
			var i;
			console.log(trackingEvents);
			for (i = 0; i < trackingEvents.length; i++) {
				for (var prop in this.eventsMap) {
					if (this.eventsMap.hasOwnProperty(prop)) {
						_mapVASTEvent(trackingEvents[i], prop, this.eventsMap[prop]);
					}
				}
			}
		},

		/**
		 * Asynchronously gets and reads VAST file form remote source given by url.
		 *
		 * @param {String} url of VAST XML
		 * @param {Object} options
		 * @returns {Promise}
		 */
		readVASTFile: function(url, options) {

			var promise = new Promise();
			var scope = this;

			// Read XML file
			Ajax.request(url).done(function(xmlDoc) {
				var objVast = {};
				// Get impression tag
				xmlDoc = $(xmlDoc);
				var impression = scope.getImpression(xmlDoc);
				if (impression !== null) {
					objVast.impression = impression;
				}
				// Get error tag
				var error = scope.getError(xmlDoc);
				if (error !== null) {
					objVast.error = error;
				}
				// Get Creative
				var trackingEvents = scope.getCreative(xmlDoc, objVast, options);
				// Get tracking events
				scope.getTrackingEvents(trackingEvents, objVast);
				promise.resolve(objVast);
			}).fail(function() {
				promise.reject();
			});

			return promise;
		},
		/**
		 * Calls through image to requested url (because of CORS).
		 */
		onLoad: function() {
			if (this.objVast.impression !== null) {
				for (var k = 0; k < this.objVast.impression.length; k++) {
					this.addImage(this.objVast.impression[k].childNodes[0].nodeValue);
				}
			}
		},
		/**
		 * Tracking of playback events.
		 *
		 * @param {Number} currentTime playback time in seconds
		 */
		onTimeUpdate: function(currentTime) {
			var i, arrTrack;
			var currentTime = Math.floor(currentTime);
			if ((currentTime <= 1)) { //Start playing Ad content
				this.sendEvent(this.eventsMap.start);
			}
			if ((currentTime === (Math.floor(this.objVast.duration / 4)))) { //First Quartile
				this.sendEvent(this.eventsMap.firstQuartile);
			}
			if ((currentTime === (Math.floor(this.objVast.duration / 2)))) { //Mid Point
				this.sendEvent(this.eventsMap.midpoint);
			}
			if ((currentTime === ((Math.floor(this.objVast.duration / 2)) + (Math.floor(
					this.objVast.duration / 4))))) { //Third Quartile
				this.sendEvent(this.eventsMap.thirdQuartile);
			}
			if ((currentTime >= (this.objVast.duration - 1))) { //End
				this.sendEvent(this.eventsMap.complete);
				// removeEventListener timeupdate
			}
		},
		/*
		 * Skip event tracking.
		 */
		skip: function() {
			this.sendEvent(this.eventsMap.skip);
		},
		/*
		 * Click event tracking.
		 */
		click: function() {
			this.sendEvent(this.eventsMap.click);
		},
		/*
		 * Fullscreen event tracking.
		 */
		fullscreen: function() {
			this.sendEvent(this.eventsMap.fullscreen);
		},
		/*
		 * Exit fullscreen event tracking.
		 */
		exitFullscreen: function() {
			this.sendEvent(this.eventsMap.exitFullscreen);
		},
		/*
		 * Expand event tracking.
		 */
		expand: function() {
			this.sendEvent(this.eventsMap.expand);
		},
		/*
		 * Progress event tracking.
		 */
		progress: function() {
			this.sendEvent(this.eventsMap.progress);
		},
		/*
		 * Close event tracking.
		 */
		close: function() {
			this.sendEvent(this.eventsMap.close);
		},
		/*
		 * Accept invitation event tracking.
		 */
		acceptInvitation: function() {
			this.sendEvent(this.eventsMap.acceptInvitation);
		},
		/*
		 * Collapse event tracking.
		 */
		collapse: function() {
			this.sendEvent(this.eventsMap.collapse);
		},
		/*
		 * Mute event tracking.
		 */
		mute: function() {
			this.sendEvent(this.eventsMap.mute);
		},
		/*
		 * Unmute event tracking.
		 */
		unmute: function() {
			this.sendEvent(this.eventsMap.unmute);
		},
		/*
		 * Pause event tracking.
		 */
		pause: function() {
			this.sendEvent(this.eventsMap.pause);
		},
		/*
		 * Creative view event tracking.
		 */
		creativeView: function() {
			this.sendEvent(this.eventsMap.createView);
		},
		/*
		 * Rewind event tracking.
		 */
		rewind: function() {
			this.sendEvent(this.eventsMap.rewind);
		},

		/**
		 * Send Event to the default VAST server
		 *
		 * @param  {String} type eventType
		 */
		sendEvent: function(type) {
			var i, arrTrack;

			if (!this.objVast[type + 'Tracked']) {
				if (this.objVast[type]) {
					arrTrack = this.objVast[type].split(' ');
					for (i = 0; i < arrTrack.length; i++) {
						this.addImage(arrTrack[i]);
					}
				}
				this.objVast[type + 'Tracked'] = true;
			}
		},

		/**
		 * Add pixel for firing impressions, tracking etc
		 *
		 * @param  {String} url of request
		 */
		addImage: function(url) {
			var image = new Image(1, 1);
			image.src = url;
		}
	});

	return VAST;
})(Events, Deferrable);