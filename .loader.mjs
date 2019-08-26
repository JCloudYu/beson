/**
 *	ISC License
 *
 *	Copyright (c) 2019, J. Cloud Yu
 *
 *	Permission to use, copy, modify, and/or distribute this software for any
 *	purpose with or without fee is hereby granted, provided that the above
 *	copyright notice and this permission notice appear in all copies.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 *	WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 *	MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 *	ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 *	WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 *	ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 *	OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
**/

/**
 *	Version: 1.0.1
 *	Author: JCloudYu
 *	Create: 2019/07/12
 *
 *	I've been encountered a stupid situation in which I want to write es module compatible libraries that
 *	can be shared between nodejs and browser, but I have to rename my file in mjs to enable es module in nodejs
 *	and at the same time, I have to provide correct mime type to make the browser accepts files ended with .mjs
 *	extension. Here's why this module comes out! This module makes the nodejs environment accept files ended with
 *	.esm.js to be a es module. Then I don't have to modify the server to tell the browser what a .js file is!
 *
 *	Moreover, this module is also designed to provide path searching logic similar to what the browsers do.
 *	This module interpret the module path according to the following rules.
 *
 *	Assume that the entry module is located a path /a/b/c/entry.esm.js, then
 *	1.	If the imported path is /i/j/k/module.esm.js,
 *		then the path resolved to /a/b/c/j/j/k/module.esm.js
 *
 *	2.	If the imported path is //i/j/k/module.esm.js,
 *		the path is resolved to /node_modules/i/j/k/modules.esm.js
 *
 *	3.	If the imported path is ./i/j/k/module.esm.js or ../i/j/k/module.esm.js
 *		and the module which imports the path is locate a /a/b/c/d/e/module.esm.js
 *		the path is resolved to /a/b/c/d/e/./i/j/k/module.esm.js or /a/b/c/d/e/../i/j/k/module.esm.js, respectively
 *
 *	4.	If the imported path doesn't matches the above conditions,
 *		then the path will be prefixed with ./ and use the condition 3 to process the path
**/
// Source: https://gist.github.com/JCloudYu/87b4a5caff65320557452167e3466dbb

import process from 'process';
import os from 'os';


// ES Modules' identifier is renamed into 'module' after NodeJS v12
const [NJS_MAJOR] = process.versions.node.split('.');
const ESM_IDENTIFIER = (NJS_MAJOR >= 12) ? 'module' : 'esm';
const CJM_IDENTIFIER = (NJS_MAJOR >= 12) ? 'commonjs' : 'cjs';

const NODE_JS_STYLED_MODULE_ROOT = true;
const IS_WINDOWS = (os.platform().substring(0,3) === "win");
const IS_WIN_ABSOLUTE_PATH = /^[a-zA-Z]:\/[^/].*$/;
const IS_COMPLETE_PATH = /^(\/\/|\/|\.\/|\.\.\/)(.*)$/;
const PATHS = [
	null,	// Reserved for main module dir
	null,	// Reserved for main module path
	`file://${IS_WINDOWS?'/':''}${process.cwd()}/`
];

export function resolve(specifier, parentModuleURL, defaultResolve) {
	// This specifier must be the main module with absolute path! (Without leading file://)
	if ( parentModuleURL === undefined ) {
		/**
		 * We don't need to detect the leading C:/ in windows env here...
		 * It has been processed to /C:/Users/XXX/Desktop/xxx.mjs already...awkward = =+
		**/
		const _MAIN_MODULE_PATH = PATHS[1] = `file://${specifier}`;
		const DIVIDER_POS = _MAIN_MODULE_PATH.lastIndexOf('/')+1;
		PATHS[0] = _MAIN_MODULE_PATH.substring(0, DIVIDER_POS);
		specifier = `./${_MAIN_MODULE_PATH.substring(DIVIDER_POS)}`;
	}
	
	
	
	// NOTE: Resolve the module type
	let _resolved_type = null;
	if ( specifier.substr(-7) === ".esm.js" ) {
		_resolved_type = ESM_IDENTIFIER;
	}
	else
	if ( specifier.substr(-3) === ".js" ) {
		_resolved_type = CJM_IDENTIFIER;
	}
	else
	if ( NJS_MAJOR >= 12 && specifier.substr(-5) === ".wasm" ) {
		_resolved_type = "wasm";
	}
	
	
	
	
	
	// NOTE: If type is detected
	if ( _resolved_type !== null ) {
		let matches = null;
		if ( IS_WINDOWS && IS_WIN_ABSOLUTE_PATH.test(specifier) ) {
			specifier = `file:///${specifier}`;
		}
		else
		if ( (matches=specifier.match(IS_COMPLETE_PATH)) !== null ) {
			switch( matches[1] ) {
				case "//":
					specifier = `${PATHS[0]}node_modules/${specifier.substring(2)}`;
					break;
					
				case "/":
					specifier = `${PATHS[0]}${specifier.substring(1)}`;
					break;
				
				case "./":
				case "../":
				default:
					break;
			}
		}
		else {
			if ( NODE_JS_STYLED_MODULE_ROOT ) {
				specifier = `${PATHS[0]}node_modules/${specifier}`;
			}
			else {
				specifier = "./" + specifier
			}
		}
		
		
		
		return {
			url: new URL(specifier, parentModuleURL||PATHS[0]).href,
			format:_resolved_type
		};
	}
	
	
	
	// NOTE: Fallback to standard nodejs module detection algorithm
	return defaultResolve(specifier, parentModuleURL);
}
