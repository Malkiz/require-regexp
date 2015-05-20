var fs = require('fs'),
	path = require('path'),
	isRegex = require('is-regex');

module.exports = loadRegex;

function loadRegex(regexs, dirpaths) {
	regexs = toArray(regexs).map(toRegex);
	dirpaths = toArray(dirpaths).map(toPath);
	var matches = getMatches(regexs, dirpaths);
	var map = {};
	matches.forEach(function (m) {
		var module = load(m);
		if (module !== undefined) {
			setProp(map, [m.name, path.join(m.dir, m.name)], module);
		}
	});
	return map;
}

function setProp(obj, props, val) {
	for (var i = 0; i < props.length; i++) {
		var name = props[i];
		if (!obj.hasOwnProperty(name)) {
			obj[name] = val;
			return;
		}
	}
}

function load(m) {
	var module;
	try {
		module = require(path.join(m.dir, m.name));
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

function toArray(val) {
	if (typeof val !== 'object' || !val.hasOwnProperty('length')) {
		val = [val];
	}
	return val;
}

function toPath(str) {
	var p = path.normalize(str);
	if (!fs.statSync(p).isDirectory()) {
		p = path.dirname(p);
	}
	return p;
}

function getMatches(regexs, dirpaths) {
	return dirpaths.reduce(function (ret, dirpath) {
		return ret.concat(fs.readdirSync(dirpath).filter(function (name) {
			return regexs.reduce(function (found, regex) {
				return found || regex.test(name);
			}, false);
		}).map(function (name) {
			return {dir : dirpath, name: name};
		}));
	}, []);
}