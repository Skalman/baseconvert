'use strict';

module.exports = function (grunt) {

	grunt.registerTask('default', [
		'less:dist',
		'copy',
		'concat',
		'uglify',
	]);

	var jsFiles = grunt.file.read('index.html', 'utf-8')
		.match(/<script src="[^"]+" defer>/g)
		.map(function (x) {
			return x.replace(/^<script src="|" defer>$/g, '');
		});

	// Set common initConfig.
	var initConfig = {
		pkg: grunt.file.readJSON('package.json'),

		less: {
			dev: {
				files: {
 					'css/main.css': 'css/main.less',
				},
			},
			dist: {
				options: {
					cleancss: true,
					modifyVars: {
						'image-base-url': 'images',
					},
					plugins: [
						(function () {
						var CleanCss = require('less-plugin-clean-css');
						return new CleanCss({advanced: true});
						}()),
					],
				},
				files: {
					'dist/app.min.css': 'css/main.less',
				},
			},
		},

		copy: {
			simple: {
				files: [{
					expand: true,
					src: [
						'images/*',
						'favicon.ico',
						'*.php',
						'.htaccess'
					],
					dest: 'dist/'
				}],
			},

			appcache: {
				files: {
					'dist/': 'app.appcache',
				},
				options: {
					process: function (src, filepath) {
						return grunt.template.process(src, initConfig);
					},
				}
			},

			logs: {
				files: {
					'dist/logs/human_access.log': 'logs/human_access.log.example',
					'dist/logs/interested_access.log': 'logs/interested_access.log.example',
					'dist/logs/use_access.log': 'logs/use_access.log.example',
				},
			},

			html: {
				files: {
					'dist/': 'index.html',
				},
				options: {
					process: function (src, filepath) {
						src = src
							// Add manifest.
							.replace('<html ', '<html manifest="app.appcache" ')

							// Replace scripts with a single script.
							.replace(/(<script[^>]+><\/script>\s*)+/, '<script src="app.min.js" defer></script>\n')

							// Inline styles.
							.replace(
								/<link rel="stylesheet"[^>]+>/,
								'<style>'+
								grunt.file.read('dist/app.min.css') +
								'</style>')

							// Remove indentation, and collapse multiple newlines into one.
							.replace(/(^|\n)[\n\t]+/g, '$1')

							// Remove comments.
							.replace(/<!\-\-([\s\S]*?)\-\->/g, function (match, p1) {
								if (p1[0] === '[') // Conditional comment.
									return match;
								else
									return '';
							});

						return src;
					},
				}
			},
		},

		concat: {
			js: {
				files: {
					'dist/app.js': jsFiles,
				},
				options: {
					// The content of the banner and the footer. Everything before 'MAIN;'
					// is the banner, everything after it is the footer.
					surround: (function () {

						/* Base Convert <%= pkg.version %> (built <%= grunt.template.today("yyyy-mm-dd") %>) | (c) 2014 Dan Wolff | License: <%= pkg.licenses[0].type %> | baseconvert.com */
						(function (window, undefined) {
							MAIN;

							// Disable debug.
							app.config(['$compileProvider', function ($compileProvider) {
								$compileProvider.debugInfoEnabled(false);
							}]);
						}(this));

					} + '').replace(/^.+?\{\s*|\}$|\t/g, '').split('MAIN;'),
					banner: '<%= concat.js.options.surround[0] %>',
					footer: '<%= concat.js.options.surround[1] %>',
				},
			},
		},

		uglify: {
			options: {
				preserveComments: function (node, comment) {
					return /^!|License:|\/LICENCE/i.test(comment.value);
				},
			},
			app: {
				files: {
					'dist/app.min.js': ['dist/app.js'],
				}
			},
		},

		watch: {
			less: {
				files: ['css/*.less', 'Gruntfile.js'],
				tasks: ['less:dev'],
			},
		},
	};


	grunt.initConfig(initConfig);

	// Load plugins.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

};
