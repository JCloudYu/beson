/**
 *	Author: JCloudYu
 *	Create: 2018/10/23
**/
((exports)=>{
	"use strict";
	
	
	class Binary {
		constructor(length=0) {
			if ( typeof length !== "number" ) {
				throw new TypeError( "Given argument should be a number!" );
			}
			
			if ( length < 0 ) {
				throw new TypeError( "length should be equal to or greater than zero!" );
			}
		
			
			this._ab = new ArrayBuffer(length);
		}
		get size() {
			return this._ab.byteLength;
		}
		clone() {
			const newInst = new Binary();
			newInst._ab = this._ab.slice(0);
			return newInst;
		}
		cut(begin, end) {
			let args = Array.prototype.slice.call(arguments, 0);
			this._ab = this._ab.slice(...args);
			return this;
		}
		append(...segments) {
			segments.unshift(this._ab);
			this._ab = ___BUFFER_CONCAT(segments);
			return this;
		}
		resize(length) {
			if ( typeof length !== "number" ) {
				throw new TypeError( "Given argument should be a number!" );
			}
			
			if ( length < 0 ) {
				throw new TypeError( "length should be equal to or greater than zero!" );
			}
			
			if ( length === this._ab.byteLength ) {
				return;
			}
			else
			if ( length < this._ab.byteLength ) {
				this._ab = this._ab.slice(0, length);
			}
			
			
			let buffer = new Uint8Array(length);
			buffer.set(new Uint8Array(this._ab), 0);
			
			this._ab = buffer.buffer;
			return this;
		}
		lshift(bits, padding=0) {
			___LEFT_SHIFT(this._ab, bits, padding);
			return this;
		}
		rshift(bits, padding=0) {
			___RIGHT_SHIFT(this._ab, bits, padding);
			return this;
		}
		not() {
			___NOT(this._ab);
			return this;
		}
		
		
		
		toBytes() {
			return this._ab;
		}
		toString(base=16) {
			switch(base) {
				case 2:
					return ___TO_BINARY_STRING(this._ab);
					
				case 16:
					return ___TO_HEX_STRING(this._ab);
				
				default:
					throw new RangeError( "Binary.prototype.toString only accepts 2 and 16 representations!" );
			}
		}
		
		
		
		static from(...segments) {
			return (new Binary()).append(...segments);
		}
		static alloc(length) {
			return new Binary(length);
		}
	}
	exports.Binary = Binary;
	
	
	
	
	// region [ Helper Functions for ArrayBuffer Alternation ]
	function ___BUFFER_CONCAT(segments) {
		let totalLength = 0;
		let buffers = [];
		for (let seg of segments) {
			if ( seg instanceof ArrayBuffer ) {
				buffers.push(seg);
				totalLength += seg.byteLength;
			}
			else
			if ( seg.buffer instanceof ArrayBuffer ) {
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
	// endregion
	
	// region [ Helper Functions for Binary Operations ]
	/**
	 * A mutable operation that shifts the bits right.
	 * Note that this function is mutable...
	 * @param {ArrayBuffer} value
	 * @param {Number} BITS
	 * @param {Number} padding
	 * @private
	**/
	function ___RIGHT_SHIFT(value, BITS, padding=0) {
		if ( typeof BITS !== "number" ) {
			throw new TypeError( "Shift bits number must be a number" );
		}
	
		const buffer = new Uint8Array(value);
		if ( BITS > 0 ) {
			padding = padding ? 0xFF : 0x00;
			if ( BITS >= buffer.byteLength * 8 ) {
				for (let off=0; off<buffer.length; off++) {
					buffer[off] = padding;
				}
			}
			else {
				const OFFSET = (BITS/8)|0;
				const REAL_SHIFT = BITS % 8;
				const REAL_SHIFT_I = 8 - REAL_SHIFT;
				const HI_MASK = REAL_SHIFT ? ___GEN_MASK(REAL_SHIFT) : 0;
				
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
	 * A mutable operation that shifts the bits left.
	 * Note that this function is mutable...
	 * @param {ArrayBuffer} value
	 * @param {Number} BITS
	 * @param {Number} padding
	 * @private
	**/
	function ___LEFT_SHIFT(value, BITS, padding=0) {
		if ( typeof BITS !== "number" ) {
			throw new TypeError( "Shift bits number must be a number" );
		}
	
		const buffer = new Uint8Array(value);
		if ( BITS > 0 ) {
			padding = padding ? 0xFF : 0x00;
			if ( BITS >= buffer.byteLength * 8 ) {
				for (let off=0; off<buffer.length; off++) {
					buffer[off] = padding;
				}
			}
			else {
				const OFFSET = (BITS/8)|0;
				const LAST_OFFSET = buffer.byteLength - OFFSET;
				const REAL_SHIFT = BITS % 8;
				const REAL_SHIFT_I = 8 - REAL_SHIFT;
				const LO_MASK = REAL_SHIFT ? (___GEN_MASK(REAL_SHIFT) << REAL_SHIFT_I) : 0;
				
				
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
	 * A mutable operation that perform bitwise not to the given UInt64 value
	 * @param {ArrayBuffer} value
	 * @private
	**/
	function ___NOT(value) {
		const buffer = new Uint8Array(value);
		for (let off=0; off<buffer.length; off++) {
			buffer[off] = ~buffer[off];
		}
	}
	
	/**
	 * Generate a 8-bits mask
	 * @param {Number} BITS
	 * @private
	**/
	function ___GEN_MASK(BITS) {
		if ( BITS > 8 ) return 0xFF;
		if ( BITS < 0 ) return 0;
	
		let val = 0;
		while( BITS-- > 0 ) {
			val = ((val << 1) | 1) >>> 0;
		}
		return val;
	}
	// endregion
	
	// region [ Helper Functions for Radix-based Rendering ]
	/**
	 * Add padding zeros to the given string data
	 * @param {string} data
	 * @param {number} length
	 * @private
	**/
	function ___PADDING_ZERO(data, length=8) {
		let padding = length - data.length;
		let padded = '';
		while(padding-- > 0) {
			padded += '0';
		}
		
		return padded + data;
	}
	
	/**
	 * Return binary representation of the given UInt64 number
	 * @param {ArrayBuffer} val
	 * @return {String}
	 * @private
	**/
	function ___TO_BINARY_STRING(val) {
		const buffer = new Uint8Array(val);
		let str = '';
		for(let val of buffer) {
			str += ___PADDING_ZERO(val.toString(2), 8);
		}
		return str;
	}
	
	/**
	 * Return hex representation of the given UInt64 number
	 * @return {String}
	 * @private
	**/
	function ___TO_HEX_STRING(val) {
		const buffer = new Uint8Array(val);
		let str = '';
		for(let val of buffer) {
			str += ___PADDING_ZERO(val.toString(16), 2);
		}
		return str;
	}
	// endregion
})((typeof window !== "undefined") ? window : (typeof module !== "undefined" ? module.exports : {}));
