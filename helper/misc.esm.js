/**
 * Author: JCloudYu
 * Create: 2018/10/30
**/
import {HAS_NODE_BUFFER} from "../constants.esm.js";

const INT8_RANGE	= [-128, 127];
const INT16_RANGE	= [-32768, 32767];
const INT32_RANGE	= [-2147483648, 2147483647];


/**
 * Convert input argument into an ArrayBuffer object.
 * Note that the returned array buffer could be shared with other instances according to the input type.
 *
 * @param {
 * 		Buffer|
 *		ArrayBuffer|
 *		Int8Array| Uint8Array|
 *		Int16Array| Uint16Array|
 *		Int32Array| Uint32Array|
 *		Float32Array| Float64Array|
 *		DataView|
 *		Number| String|
 *		{toBytes:Function}
 * } input
 * @param {Object} options
 * @param {Boolean=true} options.primitive_convert
 * @param {Boolean=false} options.primitive_convert
 * @returns {ArrayBuffer|null}
 * @constructor
 **/
export function ExtractBuffer(input, options = {primitive_convert: true, shrink_integer: false}) {
	if( input instanceof ArrayBuffer ){
		return input;
	}
	
	if( HAS_NODE_BUFFER ){
		if( input instanceof Buffer ){
			let buff = Buffer.alloc(input.length);
			input.copy(buff, 0);
			return buff.buffer;
		}
	}
	
	if( ArrayBuffer.isView(input) ){
		return input.buffer;
	}
	
	// Binarization interface
	if( Object(input) === input && (typeof input.toBytes === "function") ){
		let result = input.toBytes();
		return (result instanceof ArrayBuffer) ? result : null;
	}
	
	if( !options.primitive_convert ){
		return null;
	}
	
	
	
	// Internal Types
	const iType = typeof input;
	switch( iType ){
		case "number":{
			if( options.shrink_integer || !Number.isInteger(input) ){
				let buffer = new Float64Array(1);
				buffer[0] = input;
				return buffer.buffer;
			}
			
			// Int8
			if( input >= INT8_RANGE[0] && input <= INT8_RANGE[1] ){
				let buffer = new Int8Array(1);
				buffer[0] = input;
				return buffer.buffer;
			}
			else
			// Int16
			if( input >= INT16_RANGE[0] && input <= INT16_RANGE[1] ){
				let buffer = new Int16Array(1);
				buffer[0] = input;
				return buffer.buffer;
			}
			// Int32
			else if( input >= INT32_RANGE[0] && input <= INT32_RANGE[1] ){
				let buffer = new Int32Array(1);
				buffer[0] = input;
				return buffer.buffer;
			}
			// Others...
			else{
				let buffer = new Float64Array(1);
				buffer[0] = input;
				return buffer.buffer;
			}
		}
		case "string":
			return UTF8Encode(input);
	}
	
	return null;
}

const ___HEX_MAP_I = {
	0:0, 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9,
	a:10, b:11, c:12, d:13, e:14, f:15,
	A:10, B:11, C:12, D:13, E:14, F:15
};
const HEX_FORMAT_CHECKER = /^0x[0-9a-fA-F]+$/;
/**
 * Create an array buffer whose content is identical to the given hex string
 * @param {String} hexStr
 * @returns {Uint8Array}
**/
export function Uint8ArrayFromHex(hexStr) {
	if ( HEX_FORMAT_CHECKER.test(hexStr) ) {
		hexStr = hexStr.slice(2);
		if ( hexStr.length % 2 === 1 ) { hexStr = '0' + hexStr; }
		let buffer = new Uint8Array(hexStr.length/2);
		for( let pointer=0; pointer < buffer.length; pointer++ ) {
			let offset = pointer * 2;
			buffer[pointer] = ___HEX_MAP_I[hexStr[offset+1]] | (___HEX_MAP_I[hexStr[offset]]<<4);
		}
		return buffer;
	}
	
	throw new SyntaxError( "Given hex string is invalid!" );
}

/**
 * Convert given input array buffer content to its corresponding binary representation string
 *
 * @param {ArrayBuffer} input
 * @returns {String}
 * @constructor
 **/
export function DumpBinaryString(input) {
	let val = new Uint8Array(ExtractBuffer(input));
	
	const length = val.length;
	let str = '';
	for( let i = 0; i < length; i++ ){
		let value = val[i];
		for( let s = 0; s < 8; s++ ){
			str += ((value << s) & 0x80) ? '1' : '0';
		}
	}
	return str;
}

/**
 * Convert given input array buffer content to its corresponding binary representation string
 *
 * @param {ArrayBuffer} input
 * @returns {String}
 * @constructor
 **/
export function DumpHexString(input) {
	let val = new Uint8Array(ExtractBuffer(input));
	
	const length = val.length;
	let str = '';
	for( let i = 0; i < length; i++ ){
		let value = val[i].toString(16);
		str += `${value.length === 1 ? '0' : ''}${value}`;
	}
	return str;
}

/**
 * Encode string to UTF8 buffer
 * @param {string} str
 * @returns {ArrayBuffer}
 */
export function UTF8Encode(str) {
	let codePoints = [];
	for( let i = 0; i < str.length; i++ ){
		let codePoint = str.codePointAt(i);
		// 1-byte sequence
		if( (codePoint & 0xffffff80) === 0 ){
			codePoints.push(codePoint);
		}
		// 2-byte sequence
		else if( (codePoint & 0xfffff800) === 0 ){
			codePoints.push(
				0xc0 | (0x1f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		// 3-byte sequence
		else if( (codePoint & 0xffff0000) === 0 ){
			codePoints.push(
				0xe0 | (0x0f & (codePoint >> 12)),
				0x80 | (0x3f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		// 4-byte sequence
		else if( (codePoint & 0xffe00000) === 0 ){
			codePoints.push(
				0xf0 | (0x07 & (codePoint >> 18)),
				0x80 | (0x3f & (codePoint >> 12)),
				0x80 | (0x3f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		
		if( codePoint > 0xffff ){
			i++;
		}
	}
	return new Uint8Array(codePoints).buffer;
}

/**
 * Decode UTF8 buffer to string
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function UTF8Decode(buffer) {
	let uint8 = new Uint8Array(buffer);
	let codePoints = [];
	for( let i = 0; i < uint8.length; i++ ){
		let codePoint = uint8[i] & 0xff;
		
		// 1-byte sequence (0 ~ 127)
		if( (codePoint & 0x80) === 0 ){
			codePoints.push(codePoint);
		}
		// 2-byte sequence (192 ~ 223)
		else if( (codePoint & 0xe0) === 0xc0 ){
			codePoint = ((0x1f & uint8[i]) << 6) | (0x3f & uint8[i + 1]);
			codePoints.push(codePoint);
			i += 1;
		}
		// 3-byte sequence (224 ~ 239)
		else if( (codePoint & 0xf0) === 0xe0 ){
			codePoint = ((0x0f & uint8[i]) << 12)
				| ((0x3f & uint8[i + 1]) << 6)
				| (0x3f & uint8[i + 2]);
			codePoints.push(codePoint);
			i += 2;
		}
		// 4-byte sequence (249 ~ )
		else if( (codePoint & 0xF8) === 0xF0 ){
			codePoint = ((0x07 & uint8[i]) << 18)
				| ((0x3f & uint8[i + 1]) << 12)
				| ((0x3f & uint8[i + 2]) << 6)
				| (0x3f & uint8[i + 3]);
			codePoints.push(codePoint);
			i += 3;
		}
	}
	return String.fromCodePoint(...codePoints);
}

export function ConcatBuffers(segments) {
	let totalLength = 0;
	let buffers = [];
	for (let seg of segments) {
		if ( HAS_NODE_BUFFER && (seg instanceof Buffer)) {
			let buff = Uint8Array.from(seg);
			buffers.push(buff.buffer);
			totalLength += buff.length;
		}
		else
		if ( seg instanceof ArrayBuffer ) {
			buffers.push(seg);
			totalLength += seg.byteLength;
		}
		else
		if ( ArrayBuffer.isView(seg) ) {
			buffers.push(seg.buffer);
			totalLength += seg.buffer.byteLength;
		}
		else {
			throw new TypeError( "Binary.prototype.append only accepts ArrayBuffers" );
		}
	}
	
	let newInst = new Uint8Array(totalLength);
	let offset = 0;
	for(let seg of buffers) {
		newInst.set(new Uint8Array(seg), offset);
		offset += seg.byteLength;
	}
	
	return newInst.buffer;
}

/**
 * Generate an ArrayBuffer that contains random bytes
 * @returns {ArrayBuffer}
**/
export function RandomBytes(length) {
	if ( length < 0 ) {
		throw new RangeError( "Byte length must be equal to or greater than zero!" );
	}
	
	const buffer = new Uint8Array(length);
	for( let i=0; i<length; i++ ) {
		buffer[i] = (Math.random() * 256)|0;
	}
	
	return buffer.buffer;
}

/**
 * Get current execution environment's corresponding hostname string
 * @return {String}
 * @constructor
**/
export function GetEnvHostName() {
	try {
		if ( HAS_NODE_BUFFER ) {
			return require( 'os' ).hostname;
		}
		else
		if ( typeof window !== "undefined" ) {
			return window.location.hostname;
		}
		else {
			throw new Error("");
		}
	}
	catch(e) {
		return 'unknown.' + DumpHexString(RandomBytes(32));
	}
}
