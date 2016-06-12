'use strict';

module.exports = function (grunt) {

	grunt.registerTask('default', [
		'less:dist',
		'copy',
		'concat',
		'uglify',
	]);

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

			logs: {
				files: {
					'dist/logs/human_access.log': 'logs/human_access.log.example',
					'dist/logs/interested_access.log': 'logs/interested_access.log.example',
					'dist/logs/use_access.log': 'logs/use_access.log.example',
				},
			},

			html: {
				files: {
					'dist/': ['index.html', 'high-precision.html'],
				},
				options: {
					process: function (src, filepath) {
						src = src
							// Replace scripts with a single script.
							.replace(/(<script[^>]+><\/script>\s*)+/, '<script src="' + filepath.replace(/^(.+)\.html$/, '$1.min.js') + '" defer></script>\n')

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
					'dist/index.js': getJsFiles(grunt.file.read('index.html', 'utf-8')),
					'dist/high-precision.js': getJsFiles(grunt.file.read('high-precision.html', 'utf-8')),
				},
				options: {
					// The content of the banner and the footer. Everything before 'MAIN;'
					// is the banner, everything after it is the footer.
					surround: (function () {

						/* Base Convert <%= pkg.version %> (built <%= grunt.template.today("yyyy-mm-dd") %>) | <%= pkg.copyright %> | License: <%= pkg.licenses[0].type %> | baseconvert.com */
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
					'dist/index.min.js': ['dist/index.js'],
					'dist/high-precision.min.js': ['dist/high-precision.js'],
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

function getJsFiles(html) {
	return html
		.match(/<script src="[^"]+" defer>/g)
		.map(function (x) {
			return x.replace(/^<script src="|" defer>$/g, '');
		});

}
