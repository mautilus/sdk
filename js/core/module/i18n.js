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
 * i18n module for available languages
 * 
 * @author Mautilus s.r.o.
 * @class I18n
 * @singleton
 * @mixins Events
 */

I18n = (function(Events) {
	var I18n = {
		/**
		 * @property {Object} config General config hash
		 */
		config: null,
		/**
		 * @property {String} locale Current locale, eg. `EN`
		 */
		locale: null,
		/**
		 * @property {Object} translations Hash  of translations
		 */
		translations: {},
		/**
		 * @property {Object} languages List ob language codes ISO 639-2B/T
		 */
		languages: {
			'en': ['eng'],
			'cs': ['cze'],
			'sk': ['slo'],
			'sq': ['alb'],
			'ar': ['ara'],
			'ka': ['geo'],
			'de': ['ger'],
			'ru': ['rus'],
			'uk': ['ukr'],
			'pl': ['pol'],
			'ro': ['ron'],
			'sv': ['swe'],
			'fi': ['fin'],
			'et': ['est'],
			'bg': ['bul'],
			'fr': ['fra'],
			'hu': ['hun']
		}
	};

	$.extend(true, I18n, Events, {
		/**
		 * Initialise translation module
		 * 
		 */
		init: function(config) {
			this.configure(config);

			this.locale = this.config.locale || CONFIG.locale;
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
		 * Translate given string
		 * 
		 * @param {String} str String to translate
		 * @param {Object} [attributes] Hash of replacements
		 * @returns {String}
		 */
		translate: function(str, attributes) {
			if (!this.locale) {
				throw new Error('Locale is not set in I18n module');
			}

			var tr = this.translations[this.locale],
				l, exp;

			if (tr && typeof tr[str] !== 'undefined') {
				l = tr[str];

			} else {
				console.warn('Missing translation', str);
				l = str;
			}

			if (attributes) {
				for (var i in attributes) {
					if (attributes.hasOwnProperty(i)) {
						exp = new RegExp('{' + i + '}', 'g');
						l = l.replace(exp, attributes[i]);
					}
				}
			}

			return l;

		},
		/**
		 * Translate HTML elements. It means this function select all tag with the attribute data-i18n and call translate
		 * 
		 * @param {Object} target jQuery collection what should be translated
		 * @returns {String}
		 */
		translateHTML: function(target) {
			var scope = this;
			$('[data-i18n]', target).each(function() {
				var el = $(this);
				var tr = el.attr('data-i18n').match(/^(\w+)(.*?)$/);
				var t;
	
				if (tr && (t = scope.translate(tr[1]))) {
					el.html(t + tr[2]);
				}
			});
		},
		/**
		 * Get language code ()
		 * 
		 * @param {String} langCode in format ISO 639-2
		 * @returns {String} language code in format ISO 639-1
		 */
		getLanguage: function(langCode) {
			for (var i in this.languages) {
				if (this.languages[i][0] === langCode) {
					return i;
				}
			}

			return false;
		},
		/**
		 * Change to other language. If new language does exits, this class trigger event "langchange", which
		 * is captured by scenes and snippets.
		 * 
		 * @param {String} language code EN, AR etc.
		 * @returns {Boolean} returns true if operation sucessed or false
		 */
		changeLanguage: function(langCode) {
			if (!langCode)
				return false;
			this.locale = langCode;
			this.trigger("langchange", false, langCode);
			return true;
		},
		/*
		 * This functions tests, if the value contains Arabic signs
		 * 
         * @param {String} value string which be tested on arabic signs
		 * @returns {Boolean} returns true if string is arabic or false if not 
		 */
		isArabic: function(value) {
			patt = /[\u0600-\u06FF\u0750-\u077F]/;
			return patt.test(value);
		}
	});

	// Initialize this class when Main is ready
	Main.ready(function() {
		I18n.init();
	});

	return I18n;

})(Events);