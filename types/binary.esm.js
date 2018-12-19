/**
*	Author: JCloudYu
*	Create: 2018/10/23
**/
import {
	ExtractBuffer,
	Uint8ArrayFromHex,
	DumpHexString,
	DumpBinaryString,
	ConcatBuffers
} from "../helper.esm.js";


export class Binary {
	constructor(length=0) {
		// Special case when developer wants to initialize Binary object without an array ubffer
		let buffer = ExtractBuffer(length, {primitive_convert:false});
		if (buffer !== null) {
			this._ab = buffer;
			return;
		}
		
		
		
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
	get _ta() {
		return new Uint8Array(this._ab);
	}
	clone() {
		return new Binary(this._ab.slice(0));
	}
	slice(begin, end) {
		let args = Array.prototype.slice.call(arguments, 0);
		return new Binary(this._ab.slice(...args));
	}
	cut(begin, end) {
		let args = Array.prototype.slice.call(arguments, 0);
		this._ab = this._ab.slice(...args);
		return this;
	}
	append(...segments) {
		segments.unshift(this._ab);
		this._ab = ConcatBuffers(segments);
		return this;
	}
	set(array, offset) {
		let args = Array.prototype.slice.call(arguments, 0);
		let buff = new Uint8Array(this._ab);
		buff.set(...args);
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
	compare(value, align_cmp=true) {
		let val = ExtractBuffer(value);
		if ( val === null ) {
			throw new TypeError( "Input value cannot be converted to ArrayBuffer" );
		}
	
		return ___COMPARE(this._ab, val, align_cmp);
	}
	
	
	
	toBytes() {
		return this._ab;
	}
	toString(base=16) {
		switch(base) {
			case 2:
				return DumpBinaryString(this._ab);
				
			case 16:
				return DumpHexString(this._ab);
			
			default:
				throw new RangeError( "Binary.prototype.toString only accepts 2 and 16 representations!" );
		}
	}
	
	
	
	static from(...segments) {
		return new Binary(ConcatBuffers(segments));
	}
	static fromHex(hexString) {
		if ( hexString.substring(0, 2) !== "0x" ) {
			hexString = "0x" + hexString;
		}
		return new Binary(Uint8ArrayFromHex(hexString).buffer);
	}
	static alloc(length) {
		return new Binary(length);
	}
}






// region [ Helper Functions for Content Manipulation or Comparison ]
/**
 * Compare two UInt128 values return -1 if a < b, 1 if a > b, 0 otherwise
 * @param {ArrayBuffer} a
 * @param {ArrayBuffer} b
 * @param {Boolean} align_cmp
 * @return {Number}
 * @private
**/
function ___COMPARE(a, b, align_cmp=true) {
	if ( a.byteLength === 0 && b.byteLength === 0 ) {
		return 0;
	}
	
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