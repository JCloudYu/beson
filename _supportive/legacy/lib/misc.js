/**
 *    Author: JCloudYu
 *    Create: 2018/10/30
 **/
(()=>{
	"use strict";
	
	const {HAS_BUFFER} = require('../beson-lib/constants');
	const INT8_RANGE = [-128, 127];
	const INT16_RANGE = [-32768, 32767];
	const INT32_RANGE = [-2147483648, 2147483647];
	
	const EXPORTED = {
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
		ExtractBuffer: function(input, options = {primitive_convert: true, shrink_integer: false}) {
			if( input instanceof ArrayBuffer ){
				return input;
			}
			
			if( HAS_BUFFER ){
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
					return this.UTF8Encode(input);
			}
			
			return null;
		},
		
		/**
		 * Convert given input array buffer content to its corresponding binary representation string
		 *
		 * @param {ArrayBuffer} input
		 * @returns {String}
		 * @constructor
		 **/
		DumpBinaryString: (input)=>{
			let val = Uint8Array.from(EXPORTED.ExtractBuffer(input));
			
			const length = val.length;
			let str = '';
			for( let i = 0; i < length; i++ ){
				let value = val[i];
				for( let s = 0; s < 8; s++ ){
					str += ((value << s) & 0x80) ? '1' : '0';
				}
			}
			return str;
		},
		
		/**
		 * Convert given input array buffer content to its corresponding binary representation string
		 *
		 * @param {ArrayBuffer} input
		 * @returns {String}
		 * @constructor
		 **/
		DumpHexString: (input)=>{
			let val = Uint8Array.from(EXPORTED.ExtractBuffer(input));
			
			const length = val.length;
			let str = '';
			for( let i = 0; i < length; i++ ){
				let value = val[i].toString(16);
				str += `${value.length === 1 ? '0' : ''}${value}`;
			}
			return str;
		},
		
		/**
		 * Encode string to UTF8 buffer
		 * @param {string} str
		 * @returns {ArrayBuffer}
		 */
		UTF8Encode: (str)=>{
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
		},
		
		/**
		 * Decode UTF8 buffer to string
		 * @param {ArrayBuffer} buffer
		 * @returns {string}
		 */
		UTF8Decode: (buffer)=>{
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
	};
	
	module.exports = EXPORTED;
})();
