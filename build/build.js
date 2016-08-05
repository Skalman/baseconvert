#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('util');
var qs = require('querystring');
var http = require('http');

var base = path.normalize(__dirname + '/..') + '/';
var files = [
	'src/core.js',
	'src/leet.js',
	'src/standard.js',
	'src/twos-complement.js',
	'src/roman.js',
];
var options = {
	compilation_level: 'SIMPLE_OPTIMIZATIONS',
};
var dist = 'dist/';
var output = dist + 'base-convert.js';
var output_min = dist + 'base-convert.min.js';

main();

// Build files to dist
function main() {
	var i, code = '';

	if (!fs.existsSync(base + dist)) {
		console.log('Create directory %s', dist);
		fs.mkdirSync(base + dist, 0755);
	}
	for (i = 0; i < files.length; i++) {
		code += fs.readFileSync(base + files[i]);
	}

	console.log('Write %s (concatenated source)', output);
	fs.writeFileSync(base + output, code);
	fs.chmodSync(base + output, 0644);

	compile(code, function(err, code_min) {
		if (err) throw err;

		var savings = Math.round((1 - (code_min.length / code.length)) * 10000) / 100;
		console.log('Write %s (minified, saved %d%)', output_min, savings);

		fs.writeFileSync(base + output_min, code_min);
		fs.chmodSync(base + output_min, 0644);
	});
}

// https://github.com/weaver/scribbles/tree/master/node/google-closure

// Use the Google Closure Compiler Service to compress Javascript
// code.
//
// + code - String of javascript to compress
// + next - Function callback that accepts.
function compile(code, next) {
	try {
		var body, post_data, req,
			host = 'closure-compiler.appspot.com';

		post_data = {
			js_code: code.toString('utf-8'),
			compilation_level: options.compilation_level ? options.compilation_level : 'ADVANCED_OPTIMIZATIONS',
			output_format: 'json',
			output_info: 'compiled_code',
			warning_level: options.warning_level ? options.warning_level : 'DEFAULT',
		};
		if (options.formatting) post_data.formatting = options.formatting;
		if (options.js_externs) post_data.js_externs = options.js_externs;

		body = qs.stringify(post_data);

		req = http.request({
			host: host,
			path: '/compile',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		req.on('error', next);

		req.on('response', function(res) {
			if (res.statusCode != 200)
				next(new Error('Unexpected HTTP response: ' + res.statusCode));
			else
				capture(res, 'utf-8', parseResponse);
		});

		req.end(body);

		function parseResponse(err, data) {
			err ? next(err) : loadJSON(data, function(err, obj) {
				var error;
				if (err)
					next(err);
				else if ((error = obj.errors || obj.serverErrors || obj.warnings))
					next(new Error('Failed to compile: ' + util.inspect(error)));
				else if (obj.compiledCode.length === 0)
					next(new Error('Empty result: ' + data));
				else
					next(null, obj.compiledCode);
			});
		}
	} catch (err) {
		next(err);
	}
}

// Convert a Stream to a String.
//
// + input - Stream object
// + encoding - String input encoding
// + next - Function error/success callback
function capture(input, encoding, next) {
	var buffer = '';

	input.on('data', function(chunk) {
		buffer += chunk.toString(encoding);
	});

	input.on('end', function() {
		next(null, buffer);
	});

	input.on('error', next);
}

// Convert JSON.load() to callback-style.
//
// + data - String value to load
// + next - Function error/success callback
function loadJSON(data, next) {
	var err, obj;

	try {
		obj = JSON.parse(data);
	} catch (x) {
		err = x;
	}
	next(err, obj);
}
