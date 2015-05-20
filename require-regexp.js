var fs = require('fs'),
	path = require('path'),
	isRegex = require('is-regex');

module.exports = loadRegex;

function loadRegex(regex, dirpaths) {
	regex = toRegex(regex);
	dirpaths = toPaths(dirpaths);
	var matches = getMatches(regex, dirpaths);
	var map = {};
	matches.forEach(function (name) {
		var module = load(name);
		if (module !== undefined) {
			map[name] = module;
		}
	});
	return map;
}

function load(name) {
	var module;
	try {
		module = require(name);
    } catch (e) {
    	module = undefined;
    }
    return module;
}

function toRegex(regex) {
	if (isRegex(regex)) {
		return regex;
	}
	return new RegExp(regex);
}

function toPaths(val) {
	if (typeof val !== 'object' || !val.hasOwnProperty('length')) {
		val = [val];
	}
	return val.map(toPath);
}

function toPath(str) {
	var p = path.normalize(str);
	if (!fs.statSync(p).isDirectory()) {
		p = path.dirname(p);
	}
	return p;
}

function getMatches(regex, dirpaths) {
	return dirpaths.reduce(function (ret, dirpath) {
		return ret.concat(fs.readdirSync(dirpath).filter(function (name) {
			return regex.test(name);
		}));
	}, []);
}