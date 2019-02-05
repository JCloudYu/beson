/**
*	Author: JCloudYu
*	Create: 2018/10/23
**/
import {
	ConcatBuffers, HexToBuffer,
	BitwiseNot, BitwiseCompare, BitwiseLeftShift, BitwiseRightShift
} from "../helper.esm.js";
import {Binarized} from "./core-interfaces.esm.js";



export class Binary extends Binarized {
	clone() {
		return Binary.FromArrayBuffer(this._ab.slice(0));
	}
	slice(begin, end) {
		const args = Array.prototype.slice.call(arguments, 0);
		return Binary.FromArrayBuffer(this._ab.slice(...args));
	}
	cut(begin, end) {
		const args = Array.prototype.slice.call(arguments, 0);
		return this._set_ab(this._ab.slice(...args));
	}
	append(...segments) {
		segments.unshift(this._ab);
		return this._set_ab(ConcatBuffers(segments));
	}
	set(array, offset) {
		const args = Array.prototype.slice.call(arguments, 0);
		this._ba.set(...args);
		return this;
	}
	resize(length) {
		if ( typeof length !== "number" ) {
			throw new TypeError( "Given argument should be a number!" );
		}
		
		if ( length < 0 ) {
			throw new TypeError( "length should be equal to or greater than zero!" );
		}
		
		
		
		
		// NOTE: Do nothing if the length is not changed
		if ( length === this._ab.byteLength ) { return this; }
		
		// NOTE: Shrink data size
		if ( length < this._ab.byteLength ) {
			return this._set_ab(this._ab.slice(0, length));
		}
		
		// NOTE: Expand data size
		const buff = new Uint8Array(length);
		buff.set(this._ba, 0);
		return this._set_ab(buff.buffer);
	}
	
	
	
	lshift(bits, padding=0) {
		BitwiseLeftShift(this._ab, bits, padding);
		return this;
	}
	rshift(bits, padding=0) {
		BitwiseRightShift(this._ab, bits, padding);
		return this;
	}
	not() {
		BitwiseNot(this._ab);
		return this;
	}
	compare(value, align_cmp=true) {
		return BitwiseCompare(this._ab, value, align_cmp);
	}
	
	
	
	static Create(length) {
		return new Binary(length);
	}
	static From(...segments) {
		return Binary.FromArrayBuffer(ConcatBuffers(segments));
	}
	static FromHex(hexString) {
		if ( hexString.substring(0, 2) !== "0x" ) {
			hexString = "0x" + hexString;
		}
		
		return Binary.FromArrayBuffer(HexToBuffer(hexString));
	}
	static FromArrayBuffer(array_buffer) {
		const inst = new Binary();
		if ( !(array_buffer instanceof ArrayBuffer) ) {
			return inst;
		}
	
		return inst._set_ab(array_buffer);
	}
}
