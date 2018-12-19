// This file is to provide simple straitforawrd logic that makes
// NodeJS process modules ended with .js. Using this loader the 
// modules ended with .esm.js will be treated as es modules.
import path from 'path';
import process from 'process';

const BaseURL = new URL("file://");
BaseURL.pathname = `${process.cwd()}/`;

export function resolve(specifier, parentModuleURL, defaultResolve) {
	if (specifier.substr(-7) === ".esm.js") {
		return {
			url: new URL(specifier, parentModuleURL||BaseURL).href,
			format: 'esm'
		};
	}
	
	return defaultResolve(specifier, parentModuleURL);
}
