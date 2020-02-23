/**
*	Author: JCloudYu
*	Create: 2018/10/23
**/
import {BinaryData} from "./_core-types.esm.js";
import {
	HexToBuffer,
	BitwiseNot, BitwiseCompareBE, BitwiseLeftShiftBE, BitwiseRightShiftBE,
	___SET_BINARY_BUFFER, ReadBuffer, MergeArrayBuffers
} from "../helper.esm.js";


//@export=Binary
class __Binary extends BinaryData {
	clone() {
		return Binary.FromArrayBuffer(this._ab.slice(0));
	}
	slice(begin, end) {
		const args = Array.prototype.slice.call(arguments, 0);
		return Binary.FromArrayBuffer(this._ab.slice(...args));
	}
	cut(begin, end) {
		const args = Array.prototype.slice.call(arguments, 0);
		return ___SET_BINARY_BUFFER.call(this, this._ab.slice(...args));
	}
	append(...segments) {
		const buffers = [this._ab];
		for ( let seg of segments ) {
			const buff = ReadBuffer(seg);
			if ( buff === null ){
				throw new TypeError("Some of the given segments cannot be converted into ArrayBuffer!");
			}
			
			buffers.push(buff);
		}
		
		return ___SET_BINARY_BUFFER.call(this, MergeArrayBuffers(buffers));
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
			return ___SET_BINARY_BUFFER.call(this, this._ab.slice(0, length));
		}
		
		// NOTE: Expand data size
		const buff = new Uint8Array(length);
		buff.set(this._ba, 0);
		return ___SET_BINARY_BUFFER.call(this, buff.buffer);
	}
	
	
	
	lshift(bits, padding=0) {
		BitwiseLeftShiftBE(this._ab, bits, padding);
		return this;
	}
	rshift(bits, padding=0) {
		BitwiseRightShiftBE(this._ab, bits, padding);
		return this;
	}
	not() {
		BitwiseNot(this._ab);
		return this;
	}
	compare(value) {
		return BitwiseCompareBE(this._ab, value);
	}
	
	
	
	static create(length) {
		return new Binary(length);
	}
	static from(...args) {
		const inst = new Binary();
		if ( args.length === 0 ) { return inst; }
		
		
		
		let array_buffers;
		if ( args.length === 1 ) {
			if ( typeof args[0] === "string" ) {
				let hexString = args[0];
				if ( hexString.substring(0, 2) !== "0x" ) {
					hexString = "0x" + hexString;
				}
				
				array_buffers = [ HexToBuffer(hexString) ];
			}
			else {
				array_buffers = [ args[0] ];
			}
		}
		else {
			array_buffers = args
		}
		
		return inst.append(array_buffers);
	}
}
//@endexport

export cont Binary = __Binary;
