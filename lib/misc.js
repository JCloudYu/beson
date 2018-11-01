/**
 *	Author: JCloudYu
 *	Create: 2018/10/30
**/
(()=>{
	"use strict";
	
	const INT8_RANGE	= [-128, 127];
	const INT16_RANGE	= [-32768, 32767];
	const INT32_RANGE	= [-2147483648, 2147483647];
	
	module.exports = {
		/**
		 * Convert input argument into an ArrayBuffer object.
		 * Note that the returned array buffer could be shared with other instances according to the input type.
		 *
		 * @param {
		 *		ArrayBuffer,
		 *		Int8Array, Uint8Array,
		 *		Int16Array, Uint16Array,
		 *		Int32Array, Uint32Array,
		 *		Float32Array, Float64Array,
		 *		DataView,
		 *		Number, String,
		 *		{toBytes:Function}
		 * } input
		 * @param {Object} options
		 * @param {Boolean=true} options.primitive_convert
		 * @param {Boolean=false} options.primitive_convert
		 * @returns {ArrayBuffer|null}
		 * @constructor
		**/
		ExtractBuffer:(input, options={primitive_convert:true, shrink_integer:false})=>{
			if ( input instanceof ArrayBuffer ) {
				return input;
			}
			
			if ( ArrayBuffer.isView(input) ) {
				return input.buffer;
			}
			
			// Binarization interface
			if ( Object(input) === input && (typeof input.toBytes === "function") ) {
				let result = input.toBytes();
				return (result instanceof ArrayBuffer) ? result : null;
			}
			
			if ( !options.primitive_convert ) {
				return null;
			}
			
			
			
			// Internal Types
			const iType = typeof input;
			switch(iType) {
				case "number":
				{
					if ( options.shrink_integer || !Number.isInteger(input) ) {
						let buffer = new Float64Array(1);
						buffer[0] = input;
						return buffer.buffer;
					}
					
					// Int8
					if ( input >= INT8_RANGE[0] && input <= INT8_RANGE[1] ) {
						 let buffer = new Int8Array(1);
						 buffer[0] = input;
						 return buffer.buffer;
					}
					else
					// Int16
					if ( input >= INT16_RANGE[0] && input <= INT16_RANGE[1] ) {
						 let buffer = new Int16Array(1);
						 buffer[0] = input;
						 return buffer.buffer;
					}
					// Int32
					else
					if ( input >= INT32_RANGE[0] && input <= INT32_RANGE[1] ) {
						let buffer = new Int32Array(1);
						 buffer[0] = input;
						 return buffer.buffer;
					}
					// Others...
					else {
						let buffer = new Float64Array(1);
						buffer[0] = input;
						return buffer.buffer;
					}
				}
				case "string":
				{
					let buffer = new Uint16Array(input.length);
					for(let i=0; i<input.length; i++) { buffer[i] = input.charCodeAt(i); }
					return buffer.buffer;
				}
			}
			
			return null;
		}
	};
})();
