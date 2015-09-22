module.exports = function(grunt, projectPath) {

	grunt.loadNpmTasks('grunt-processhtml');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-string-replace');

	grunt.initConfig({
		pkg: grunt.file.readJSON('./package.json'),

		clean: {
			nonmin: ['output/nonmin'],
			all: ['output']
		},

		copy: {
			main: {
				files: [
					{
						expand: true,
						src: ['../index.html'],
						dest: 'output/source/*',
						filter: 'isFile'
					},
					{
						expand: true,
						src: ['../LICENSE.TXT'],
						dest: 'output/source/*',
						filter: 'isFile'
					},
					{
						expand: true,
						src: ['../config.js'],
						dest: 'output/source/*',
						filter: 'isFile'
					},
					// Samsung
					{
						expand: true,
						src: ['../config.xml'],
						dest: 'output/source/*',
						filter: 'isFile'
					},
					{
						expand: true,
						src: ['../widget.info'],
						dest: 'output/source/*',
						filter: 'isFile'
					},
					// LG
					{
						expand: true,
						src: ['../developer.test'],
						dest: 'output/source/*',
						filter: 'isFile'
					},
					{
						expand: true,
						src: ['../manifest.xml'],
						dest: 'output/source/*',
						filter: 'isFile'
					},
					// all
					{
						expand: true,
						src: ['../fonts/**'],
						dest: 'output/source/*'
					},
					{
						expand: true,
						src: ['../icons/**'],
						dest: 'output/source/*'
					},
					{
						expand: true,
						src: ['../img/**'],
						dest: 'output/source/*'
					},
					{
						expand: true,
						src: ['../videos/**'],
						dest: 'output/source/*'
					}
				]
			}
		},

		'string-replace': {
			ver: {
				files: [
					{
						src: ['output/source/config.js'],
						dest: './'
					},
					{
						src: ['output/source/config.xml'],
						dest: './'
					}
				],
				options: {
					replacements: [{
							pattern: /version:.*\'(.*)\'/,
							replacement: 'version: \'<%= pkg.version %> [<%= grunt.template.today("dd.mm.yyyy") %>]\''
						}, {
							pattern: /(<ver itemtype="string">)(.*)(<\/ver>)/,
							replacement: '$1<%= pkg.version %>$3'
						}
					]
				}
			},
			indexSamsung: {
				files: [
					{src: ['output/source/index.html'], dest: 'output/samsung/index.html'},
				],
				options: {
					replacements: [{
							pattern: /js\/source\.min\.js/,
							replacement: 'js/source.min.samsung.js'
						}
					]
				}
			},
			indexTizen: {
				files: [
					{src: ['output/source/index.html'], dest: 'output/tizen/index.html'},
				],
				options: {
					replacements: [{
							pattern: /js\/source\.min\.js/,
							replacement: 'js/source.min.tizen.js'
						}
					]
				}
			},
			indexLg: {
				files: [
					{src: ['output/source/index.html'], dest: 'output/lg/index.html'},
				],
				options: {
					replacements: [{
							pattern: /js\/source\.min\.js/,
							replacement: 'js/source.min.lg.js'
						}
					]
				}
			}
		},

		cssmin: {
			minify: {
				options: {
					banner: '/**\n * App name: <%= pkg.name %>\n * App version: <%= pkg.version %>\n * Author: <%= pkg.author %>\n * Build: <%= grunt.template.today("dd-mm-yyyy hh:MM") %>\n**/'
				},
				src: [
				      '../css/*.css',
				      '../../../css/keyboard.css'
				],
				dest: 'output/source/css/main.min.css',
			},
		},

		processhtml: {
			options: {
				data: {
				 message: ''
				}
			},
			dist: {
				files: {
					'output/source/index.html': ['output/source/index.html']
				}
			}
		},

		htmlmin: {
			minify: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					minifyJS: true
				},
				files: {
					'output/source/index.html': 'output/source/index.html',
				}
			}
		},

		concat: {
			options: {
				separator: '\n',
				stripBanners: true
			},

			core: {
				src: [
					'../../../js/core/jquery.js',
					'../../../js/core/jasmine.js',
					'../../../js/core/json2.js',
					'../../../js/core/md5.js',
					'../../../js/core/sha1.js',
					'../../../js/core/moment.js',
					'../../../js/core/mustache.js',
					'../../../js/core/helpers.js',
					'../../../js/core/main.js',

					'../../../js/core/module/developer.js',
					'../../../js/core/module/events.js',
					'../../../js/core/module/device.js',
					'../../../js/core/module/storage.js',
					'../../../js/core/module/control.js',
					'../../../js/core/module/defer.js',
					'../../../js/core/module/deferrable.js',
					'../../../js/core/module/focus.js',
					'../../../js/core/module/mouse.js',
					'../../../js/core/module/promise.js',
					'../../../js/core/module/router.js',
					'../../../js/core/module/input.js',
					'../../../js/core/module/keyboard.js',
					'../../../js/core/module/scene.js',
					'../../../js/core/module/snippet.js',
					'../../../js/core/module/model.js',
					'../../../js/core/module/collection.js',
					'../../../js/core/module/ajax.js',
					'../../../js/core/module/i18n.js',
					'../../../js/core/module/player.js',
					'../../../js/core/module/player_audio.js',
					'../../../js/core/module/playready.js',
					'../../../js/core/module/subtitles.js',
					'../../../js/core/module/template.js',
					'../../../js/core/module/analytics.js',

				],
				dest: 'output/nomin/core.js'
			},

			driverSamsung: {
				src: [
					'../../../js/core/device/samsung.js',
					'../../../js/core/device/samsung/*'
				],
				dest: 'output/nomin/driver.samsung.js'
			},

			driverTizen: {
				src: [
					'../../../js/core/device/tizen.js',
					'../../../js/core/device/tizen/*'
				],
				dest: 'output/nomin/driver.tizen.js'
			},

			driverLg: {
				src: [
					'../../../js/core/device/lg.js',
					'../../../js/core/device/lg/*'
				],
				dest: 'output/nomin/driver.lg.js'
			},

			driverAll: {
				src: [
					'output/nomin/driver.*.js'
				],
				dest: 'output/nomin/driver.all.js'
			},

			i18n: {
				src: ['../js/i18n/*.js'],
				dest: 'output/nomin/i18n.js'
			},

			snippet: {
				src: ['../js/snippet/*.js'],
				dest: 'output/nomin/snippet.js'
			},

			scene: {
				src: ['../js/scene/*'],
				dest: 'output/nomin/scene.js'
			},

			model: {
				src: ['../js/model/*'],
				dest: 'output/nomin/model.js'
			},

			collection: {
				src: [
						'../js/collection/base_collection.js',
						'../js/collection/custom_collection.js',
						'../js/collection/*'
					],
				dest: 'output/nomin/collection.js'
			},

			module: {
				src: ['../js/module/*'],
				dest: 'output/nomin/module.js'
			},

			app: {
				src: ['../js/app.js'],
				dest: 'output/nomin/app.js'
			},

			main: {
				src: [
					'output/nomin/core.js',
					'output/nomin/driver.all.js',
					'output/nomin/i18n.js',
					'output/nomin/collection.js',
					'output/nomin/snippet.js',
					'output/nomin/scene.js',
					'output/nomin/model.js',
					'output/nomin/module.js'
				],
				dest: 'output/nomin/source.all.js'
			},

			mainSamsung: {
				src: [
					'output/nomin/core.js',
					'<%= concat.driverSamsung.dest %>',
					'output/nomin/i18n.js',
					'output/nomin/collection.js',
					'output/nomin/snippet.js',
					'output/nomin/scene.js',
					'output/nomin/model.js',
					'output/nomin/module.js'
				],
				dest: 'output/nomin/source.all.samsung.js'
			},

			mainTizen: {
				src: [
					'output/nomin/core.js',
					'<%= concat.driverTizen.dest %>',
					'output/nomin/i18n.js',
					'output/nomin/collection.js',
					'output/nomin/snippet.js',
					'output/nomin/scene.js',
					'output/nomin/model.js',
					'output/nomin/module.js'
				],
				dest: 'output/nomin/source.all.tizen.js'
			},

			mainLg: {
				src: [
					'output/nomin/core.js',
					'<%= concat.driverLg.dest %>',
					'output/nomin/i18n.js',
					'output/nomin/collection.js',
					'output/nomin/snippet.js',
					'output/nomin/scene.js',
					'output/nomin/model.js',
					'output/nomin/module.js'
				],
				dest: 'output/nomin/source.all.lg.js'
			}

		},

		uglify: {
			minify: {
				options: {
					banner: '/**\n * App name: <%= pkg.name %>\n * App version: <%= pkg.version %>\n * Author: <%= pkg.author %>\n * Build: <%= grunt.template.today("dd-mm-yyyy hh:MM") %>\n**/\n'
				},
				files: [
					{'output/source/js/source.min.js': ['<%= concat.main.dest %>']},
					{'output/source/js/app.min.js': ['<%= concat.app.dest %>']},
					{'output/samsung/js/source.min.samsung.js': ['<%= concat.mainSamsung.dest %>']},
					{'output/tizen/js/source.min.tizen.js': ['<%= concat.mainTizen.dest %>']},
					{'output/lg/js/source.min.lg.js': ['<%= concat.mainLg.dest %>']}
				]
			}
		},

		compress: {
			samsung: {
				options: {
					archive: function () {
						var pkg = grunt.file.readJSON('./package.json');
						return pkg.packagename + '_ver_' + pkg.version.replace(/\./gi, '_') + '_Samsung.zip';
					}
				},
				files: [
					{
						expand: true,
						cwd: 'output/source/',
						src: [
							'**/*',
							'!developer.test',
							'!manifest.xml',
							'!configurations/**',
							'!icon/**',
							'!index.*',
							'!js/source.*'
						],
						dest: './'
					},
					{
						expand: true,
						cwd: 'output/samsung',
						src: ['index.html'],
						dest: './'
					},
					{
						expand: true,
						cwd: 'output/samsung/',
						src: ['js/source.min.samsung.js'],
						dest: './'
					},
					{
						expand: true,
						cwd: 'output/source/icon/samsung',
						src: ['*'],
						dest: './icon/samsung'
					}
				]
			},

			tizen: {
				options: {
					archive: function () {
						var pkg = grunt.file.readJSON('./package.json');
						return pkg.packagename + '_ver_' + pkg.version.replace(/\./gi, '_') + '_Tizen.zip';
					}
				},
				files: [
					{
						expand: true,
						cwd: 'output/source/',
						src: [
							'**/*',
							'!developer.test',
							'!manifest.xml',
							'!configurations/**',
							'!icon/**',
							'!index.*',
							'!js/source.*'
						],
						dest: './'
					},
					{
						expand: true,
						cwd: 'output/tizen',
						src: ['index.html'],
						dest: './'
					},
					{
						expand: true,
						cwd: 'output/tizen/',
						src: ['js/source.min.tizen.js'],
						dest: './'
					},
					{
						expand: true,
						cwd: 'output/source/icon/tizen',
						src: ['*'],
						dest: './icon/tizen'
					}
				]
			},

			lg: {
				options: {
					archive: function () {
						var pkg = grunt.file.readJSON('./package.json');
						return pkg.packagename + '_ver_' + pkg.version.replace(/\./gi, '_') + '_LG.zip';
					}
				},
				files: [
					{
						expand: true,
						cwd: 'output/source/',
						src: [
							'**/*', '!config.xml',
							'!configurations/**',
							'!icon/**',
							'!index.*',
							'!js/source.*'
						],
						dest: './lgapps/installed/312376/'
					},
					{
						expand: true,
						cwd: 'output/lg',
						src: ['index.html'],
						dest: './lgapps/installed/312376/'
					},
					{
						expand: true,
						cwd: 'output/lg/',
						src: ['js/source.min.lg.js'],
						dest: './lgapps/installed/312376/'
					},
					{
						expand: true,
						cwd: 'output/source/icons/lg',
						src: ['*'],
						dest: './lgapps/installed/312376/'
					}
				]
			}

		}

	});

	grunt.registerTask('default', [
			'clean',
			'copy',
			'string-replace:ver',
			'processhtml',
			'cssmin',
			'htmlmin',
			'string-replace:indexSamsung',
			'string-replace:indexTizen',
			'string-replace:indexLg',
			'concat',
			'uglify',
			'compress:samsung',
			'compress:tizen',
			'compress:lg',
			//'clean'
		]
	);

};