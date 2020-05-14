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
 *	Version: 1.0.3
 *	Author: JCloudYu
 *	Create: 2019/03/03
 *	Update: 2020/04/08
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
import {get as https_get} from 'https';
import {get as http_get} from 'http';


// ES Modules' identifier is renamed into 'module' after NodeJS v12
const [NJS_MAJOR] = process.versions.node.split('.');
const ESM_IDENTIFIER = (NJS_MAJOR >= 12) ? 'module' : 'esm';
const CJM_IDENTIFIER = (NJS_MAJOR >= 12) ? 'commonjs' : 'cjs';
const WASM_IDENTIFIER = "wasm";

const NODE_JS_STYLED_MODULE_ROOT = true;
const IS_WINDOWS = (os.platform().substring(0, 3) === "win");
const IS_WIN_ABSOLUTE_PATH = /^[a-zA-Z]:\/[^/].*$/;
const IS_COMPLETE_PATH = /^(\/\/|\/|\.\/|\.\.\/)(.*)$/;
const IS_NET_SCRIPT = /^(http|https):\/\/.*$/;
const PATHS = [
	null,	// Reserved for main module dir
	null,	// Reserved for main module path
	`file://${ IS_WINDOWS ? '/' : '' }${ process.cwd() }/`
];




let _RESOLVE_API = (...args)=>{
	let is_entry;
	if( Object(args[1]) === args[1] ){
		_RESOLVE_API = ___RESOLVE_NEW_ARCH;
		is_entry = (args[1].parentURL === undefined);
	}
	else{
		_RESOLVE_API = ___RESOLVE_OLD_ARCH;
		is_entry = (args[1] === undefined);
	}
	
	
	
	if( is_entry ){
		/**
		 * We don't need to detect the leading C:/ in windows env here...
		 * It has been processed to /C:/Users/XXX/Desktop/xxx.mjs already...
		 *
		 * BUT!!! Different nodejs versions will result in different boot specifier...
		 * node@12.13.1 will add leading file:// to specifier but not in 12.6...awkward = =+
		 **/
		
		
		const specifier = args[0];
		PATHS[1] = (specifier.substring(0, 7) !== "file://") ? `file://${ specifier }` : specifier;
		
		const _MAIN_MODULE_PATH = PATHS[1];
		const DIVIDER_POS = _MAIN_MODULE_PATH.lastIndexOf('/') + 1;
		PATHS[0] = _MAIN_MODULE_PATH.substring(0, DIVIDER_POS);
		args[0] = `./${ _MAIN_MODULE_PATH.substring(DIVIDER_POS) }`;
	}
	
	return _RESOLVE_API(...args);
};






async function ___RESOLVE_NEW_ARCH(specifier, context, defaultResolve){
	const {parentURL} = context;
	const matches = specifier.match(IS_COMPLETE_PATH);
	
	
	if( IS_WINDOWS && IS_WIN_ABSOLUTE_PATH.test(specifier) ){
		specifier = `file:///${ specifier }`;
	}
	else if( IS_NET_SCRIPT.test(specifier) ){
		return {url: specifier};
	}
	else if( parentURL && IS_NET_SCRIPT.test(parentURL) ){
		return {url: new URL(specifier, parentURL).href};
	}
	else if( matches !== null ){
		switch( matches[1] ){
			case "//":
				specifier = specifier.substring(2);
				break;
			
			case "/":
				specifier = `${ PATHS[0] }${ specifier.substring(1) }`;
				break;
			
			case "./":
			case "../":
			default:
				break;
		}
	}
	
	
	
	return defaultResolve(specifier, context, defaultResolve);
}
async function ___RESOLVE_OLD_ARCH(specifier, parentModuleURL, defaultResolve){
	// NOTE: Resolve the module type
	const _resolved_type = ___RESOLVE_SOURCE_TYPE(specifier);
	if( !_resolved_type ){
		return defaultResolve(specifier, parentModuleURL, defaultResolve);
	}
	
	
	
	let matches = null;
	if( IS_WINDOWS && IS_WIN_ABSOLUTE_PATH.test(specifier) ){
		specifier = `file:///${ specifier }`;
	}
	else if( (matches = specifier.match(IS_COMPLETE_PATH)) !== null ){
		switch( matches[1] ){
			case "//":
				specifier = `${ PATHS[0] }node_modules/${ specifier.substring(2) }`;
				break;
			
			case "/":
				specifier = `${ PATHS[0] }${ specifier.substring(1) }`;
				break;
			
			case "./":
			case "../":
			default:
				break;
		}
	}
	else
	if ( specifier.substring(0, 7) !== "file://" ) {
		if( NODE_JS_STYLED_MODULE_ROOT ){
			specifier = `${ PATHS[0] }node_modules/${ specifier }`;
		}
		else{
			specifier = "./" + specifier
		}
	}
	
	
	
	return {
		url: new URL(specifier, parentModuleURL || PATHS[0]).href,
		format: _resolved_type
	};
}
function ___RESOLVE_SOURCE_TYPE(specifier){
	let _resolved_type = null;
	if( IS_NET_SCRIPT.test(specifier) ){
		_resolved_type = ESM_IDENTIFIER;
	}
	else if( specifier.substr(-7) === ".esm.js" ){
		_resolved_type = ESM_IDENTIFIER;
	}
	else if( specifier.substr(-4) === ".mjs" ){
		_resolved_type = ESM_IDENTIFIER;
	}
	else if( specifier.substr(-3) === ".js" ){
		_resolved_type = CJM_IDENTIFIER;
	}
	else if( NJS_MAJOR >= 12 && specifier.substr(-5) === ".wasm" ){
		_resolved_type = WASM_IDENTIFIER;
	}
	
	
	return _resolved_type;
}



export function resolve(...args){
	return _RESOLVE_API(...args);
}
export async function getFormat(url, context, defaultGetFormat){
	const type_identifier = ___RESOLVE_SOURCE_TYPE(url);
	return !type_identifier ?
		defaultGetFormat(url, context, defaultGetFormat) :
		{format: type_identifier};
}
export function getSource(url, context, defaultGetSource){
	if ( IS_NET_SCRIPT.test(url) ){
		return new Promise((resolve, reject)=>{
			const fetch_api = (url.substring(0, 5) === "https") ? https_get : http_get;
			
			fetch_api(url, (res)=>{
				let data = '';
				res.on('data', (chunk)=>data += chunk);
				res.on('end', ()=>resolve({source: data}));
			}).on('error', (err)=>reject(err));
		});
	}
	
	return defaultGetSource(url, context, defaultGetSource);
}
