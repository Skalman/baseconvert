#!/usr/bin/env node

var fs = require("fs"),
	path = require("path"),
	util = require("util"),
	qs = require("querystring"),
	http = require("http"),

	base = path.normalize(__dirname + "/..") + "/",
	files = [
		"src/core.js",
		"src/number.js",
		"src/standard.js",
		"src/roman.js",
		"src/leet.js"
	],
	options = {
		// formatting: "pretty_print",
		compilation_level: "SIMPLE_OPTIMIZATIONS",
		// warning_level: "VERBOSE",
	}
	js_externs_file = "build/externs.js",
	dist = "dist/",
	output = dist + "base_convert.js",
	output_min = dist + "base_convert.min.js";

main();

// Build files to dist
function main() {
	var i, code = "";

	if (!path.existsSync(base + dist)) {
		console.log("Create directory %s", dist)
		fs.mkdirSync(base + dist, 0744);
	}
	for (i = 0; i < files.length; i++) {
		code += fs.readFileSync(base + files[i]);
	}

	console.log("Write %s (concatenated source)", output);
	fs.writeFileSync(base + output, code);

	compile(code, function(err, code_min) {
		if (err) throw err;

		var savings = Math.round((1 - (code_min.length / code.length)) * 10000) / 100;
		console.log("Write %s (minified, saved %d%)", output_min, savings);

		fs.writeFileSync(base + output_min, code_min);
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
		var body, post_data, client, req,
			host = "closure-compiler.appspot.com";

		post_data = {
			js_code: code.toString("utf-8"),
			compilation_level: options.compilation_level ? options.compilation_level : "ADVANCED_OPTIMIZATIONS",
			output_format: "json",
			output_info: "compiled_code",
			warning_level: options.warning_level ? options.warning_level : "DEFAULT",
		};
		if (options.formatting) post_data.formatting = options.formatting;
		if (options.js_externs) post_data.js_externs = options.js_externs;

		body = qs.stringify(post_data);

		client = http.createClient(80, host).on("error", next);
		req = client.request("POST", "/compile", {
			"Host": host,
			"Content-Length": body.length,
			"Content-Type": "application/x-www-form-urlencoded"
		});

		req.on("error", next).end(body);

		req.on("response", function(res) {
			if (res.statusCode != 200)
				next(new Error("Unexpected HTTP response: " + res.statusCode));
			else
				capture(res, "utf-8", parseResponse);
		});

		function parseResponse(err, data) {
			err ? next(err) : loadJSON(data, function(err, obj) {
				var error;
				if (err)
					next(err);
				else if ((error = obj.errors || obj.serverErrors || obj.warnings))
					next(new Error("Failed to compile: " + util.inspect(error)));
				else if (obj.compiledCode.length === 0)
					next(new Error("Empty result: " + data));
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
	var buffer = "";

	input.on("data", function(chunk) {
		buffer += chunk.toString(encoding);
	});

	input.on("end", function() {
		next(null, buffer);
	});

	input.on("error", next);
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
