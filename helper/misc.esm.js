/**
 * Author: JCloudYu
 * Create: 2018/10/30
**/
import {HAS_NODE_BUFFER} from "../constants.esm.js";

const INT8_RANGE	= [-128, 127];
const INT16_RANGE	= [-32768, 32767];
const INT32_RANGE	= [-2147483648, 2147483647];
const HEX_FORMAT_CHECKER = /^0x[0-9a-fA-F]+$/;
const HEX_MAP_INVERSE = {
	0:0, 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9,
	a:10, b:11, c:12, d:13, e:14, f:15,
	A:10, B:11, C:12, D:13, E:14, F:15
};


/**
 *	@typedef {
 *		Buffer|
 *		Uint8ClampedArray|Uint8Array|Int8Array|
 *		Uint16Array|Int16Array|
 *		Uint32Array|Int32Array|
 *		Float32Array|Float64Array
 *	} TypedArray
**/






/**
 * Get buffers from input
 * @param {ArrayBuffer|TypedArray|DataView} input
 * @return {ArrayBuffer|null}
**/
export function ObtainBuffer(input) {
	if ( HAS_NODE_BUFFER ) {
		if( input instanceof Buffer ){
			let buff = Buffer.alloc(input.length);
			input.copy(buff, 0);
			return buff.buffer;
		}
	}
	
	if ( ArrayBuffer.isView(input) ) {
		return input.buffer;
	}
	
	if ( input instanceof ArrayBuffer ) {
		return input;
	}
	
	return null;
}

/**
 * Combine ArrayBuffers into one ArrayBuffer
 * @param segments
 * @return {ArrayBufferLike}
 * @constructor
**/
export function ConcatBuffers(segments) {
	const buffers = [];
	
	// NOTE: Convert all segments into ArrayBuffers and calculate the total size
	let totalLength = 0;
	for (let seg of segments) {
		const buff = ObtainBuffer(seg);
		if ( buff === null ) {
			throw new TypeError( "Given segments contains invalid format!" );
		}
		else {
			buffers.push(buff);
			totalLength += buff.byteLength;
		}
	}
	
	
	// NOTE: Copy all data
	const newInst = new Uint8Array(totalLength);
	let offset = 0;
	for(let seg of buffers) {
		newInst.set(new Uint8Array(seg), offset);
		offset += seg.byteLength;
	}
	
	return newInst.buffer;
}

/**
 * Generate ArrayBuffer from hex string
 * @param {String} hexStr
**/
export function HexToBuffer(hexStr) {
	if ( HEX_FORMAT_CHECKER.test(hexStr) ) {
		hexStr = hexStr.slice(2);
		if ( hexStr.length % 2 === 1 ) { hexStr = '0' + hexStr; }
		let buffer = new Uint8Array(hexStr.length/2);
		for( let pointer=0; pointer < buffer.length; pointer++ ) {
			let offset = pointer * 2;
			buffer[pointer] = HEX_MAP_INVERSE[hexStr[offset+1]] | (HEX_MAP_INVERSE[hexStr[offset]]<<4);
		}
		return buffer.buffer;
	}
	
	throw new SyntaxError( "Given hex string is invalid!" );
}

/**
 * Perform bitwise not operation on given input
 * @param {ArrayBuffer|TypedArray|DataView} input
**/
export function BitwiseNot(input) {
	input = ObtainBuffer(input);
	if ( input === null ) {
		throw new TypeError( "Given input must be an ArrayBuffer!" );
	}

	const buffer = new Uint8Array(input);
	for (let off=0; off<buffer.length; off++) {
		buffer[off] = ~buffer[off];
	}
}

/**
 * Perform bitwise compare operation between the given inputs.
 * Returns 1 if a > b, -1 if a < b, 0 otherwise.
 *
 * @param {ArrayBuffer|TypedArray|DataView} a
 * @param {ArrayBuffer|TypedArray|DataView} b
 * @param {Boolean} [align_cmp=true]
 * @return {Number}
**/
export function BitwiseCompare(a, b, align_cmp=true) {
	a = ObtainBuffer(a);
	b = ObtainBuffer(b);
	if ( a === null || b === null ) {
		throw new TypeError( "Given inputs must be an ArrayBuffer!" );
	}
	
	
	// NOTE: Compare nothing...
	if ( a.byteLength === 0 && b.byteLength === 0 ) { return 0; }
	
	
	let A = new Uint8Array(a);
	let B = new Uint8Array(b);
	if ( !align_cmp ) {
		let valA, valB, max = A.length > B.length ? A.length : B.length;
		for( let i=0; i<max; i++ ) {
			valA = A[i] || 0; valB = B[i] || 0;
			if ( valA === valB ) {
				continue;
			}
			
			return valA > valB ? 1 : -1;
		}
		
		return 0;
	}
	else {
		let shiftA, shiftB, valA, valB, max, offset;
		if ( A.length > B.length ) {
			max = A.length;
			shiftA = 0;
			shiftB = B.length - A.length;
		}
		else
		if ( A.length < B.length ) {
			max = B.length;
			shiftA = A.length - B.length;
			shiftB = 0;
		}
		else {
			max = A.length;
			shiftA = shiftB = 0;
		}
		
		for( let i=0; i<max; i++ ) {
			valA = (offset=i+shiftA) >= 0 ? A[offset] : 0;
			valB = (offset=i+shiftB) >= 0 ? B[offset] : 0;
			if ( valA === valB ) { continue; }
			
			return valA > valB ? 1 : -1;
		}
		
		return 0;
	}
}

/**
 * Perform bitwise right shift operation on given input
 * @param {ArrayBuffer|TypedArray|DataView} value
 * @param {Number} shift
 * @param {Number} [padding=0]
**/
export function BitwiseRightShift(value, shift, padding=0) {
	if ( typeof shift !== "number" ) {
		throw new TypeError( "Shift bits number must be a number" );
	}
	
	value = ObtainBuffer(value);
	if ( value === null ) {
		throw new TypeError( "Given value must be an ArrayBuffer!" );
	}
	
	
	
	const buffer = new Uint8Array(value);
	if ( shift > 0 ) {
		padding = padding ? 0xFF : 0x00;
		if ( shift >= buffer.byteLength * 8 ) {
			for (let off=0; off<buffer.length; off++) {
				buffer[off] = padding;
			}
		}
		else {
			const OFFSET = (shift/8)|0;
			const REAL_SHIFT = shift % 8;
			const REAL_SHIFT_I = 8 - REAL_SHIFT;
			const HI_MASK = REAL_SHIFT ? ___GEN_8BITS_MASK(REAL_SHIFT) : 0;
			
			for (let off=(buffer.byteLength-1); off>=OFFSET; off--) {
				let shift = off - OFFSET;
				
				if ( REAL_SHIFT === 0 ) {
					buffer[off] = buffer[shift];
				}
				else {
					let shiftVal = buffer[shift];
					let next = (shift === 0) ? padding : buffer[shift-1];
					buffer[off] = (shiftVal >>> REAL_SHIFT) | ((next & HI_MASK) << REAL_SHIFT_I);
				}
			}
			
			for ( let off=OFFSET-1; off>=0; off-- ) {
				buffer[off] = padding;
			}
		}
	}
}

/**
 * Perform bitwise left shift operation on given input
 * @param {ArrayBuffer|TypedArray|DataView} value
 * @param {Number} shift
 * @param {Number} [padding=0]
**/
export function BitwiseLeftShift(value, shift, padding=0) {
	if ( typeof shift !== "number" ) {
		throw new TypeError( "Shift bits must be a number!" );
	}
	
	value = ObtainBuffer(value);
	if ( value === null ) {
		throw new TypeError( "Given value must be an ArrayBuffer!" );
	}
	
	
	
	const buffer = new Uint8Array(value);
	if ( shift > 0 ) {
		padding = padding ? 0xFF : 0x00;
		if ( shift >= buffer.byteLength * 8 ) {
			for (let off=0; off<buffer.length; off++) {
				buffer[off] = padding;
			}
		}
		else {
			const OFFSET = (shift/8)|0;
			const LAST_OFFSET = buffer.byteLength - OFFSET;
			const REAL_SHIFT = shift % 8;
			const REAL_SHIFT_I = 8 - REAL_SHIFT;
			const LO_MASK = REAL_SHIFT ? (___GEN_8BITS_MASK(REAL_SHIFT) << REAL_SHIFT_I) : 0;
			
			
			for (let off=0; off<LAST_OFFSET; off++) {
				let shift = off + OFFSET;
				
				if ( REAL_SHIFT === 0 ) {
					buffer[off] = buffer[shift];
				}
				else {
					let shiftVal = buffer[shift];
					let next = shift >= (buffer.byteLength - 1) ? padding : buffer[shift+1];
					buffer[off] = (shiftVal<< REAL_SHIFT) | ((next & LO_MASK) >> REAL_SHIFT_I);
				}
			}
			
			for ( let off=LAST_OFFSET; off<buffer.byteLength; off++ ) {
				buffer[off] = padding;
			}
		}
	}
}




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
	let buff = ObtainBuffer(input);
	if ( buff === null ) {
		return buff;
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










/**
 * Create an array buffer whose content is identical to the given hex string
 * @param {String} hexStr
 * @returns {Uint8Array}
**/
export function Uint8ArrayFromHex(hexStr) {
	return new Uint8Array(HexToBuffer(hexStr));
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






/**
 * Generate a 8-bits mask
 * @param {Number} BITS
 * @private
**/
function ___GEN_8BITS_MASK(BITS) {
	if ( BITS > 8 ) return 0xFF;
	if ( BITS < 0 ) return 0;

	let val = 0;
	while( BITS-- > 0 ) {
		val = ((val << 1) | 1) >>> 0;
	}
	return val;
}
