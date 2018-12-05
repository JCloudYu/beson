/**
 *	Author: JCloudYu
 *	Create: 2018/12/04
**/
((exports)=>{
	"use strict";
	
	
	const {Binarized} = require( './binarized' );
	class BinarizedInt extends Binarized {
		/**
		 * Return a copy of the contained binary data and resize the data into specific size
		 *
		 * @param {Number} size
		 * @returns {ArrayBuffer}
		**/
		toBytes(size=null) {
			if ( arguments.length <= 0 || typeof size !== "number" || size < 0 || this._ab.byteLength === size ) {
				return this._ab.slice(0);
			}
		
			if ( this._ab.byteLength > size ) {
				return this._ab.slice(0, size);
			}
			else
			if ( this._ab.byteLength === 0 ) {
				return new ArrayBuffer(size);
			}
			else {
				const fill = !this.isSignedInt ? 0 : ((this._ba[this._ba.length-1] & 0x80) === 0 ? 0 : 1);
				const buffer = new Uint8Array(size);
				for(let i=0; i<buffer.length; i++) {
					buffer[i] = fill;
				}
				
				buffer.set(this._ba);
				return buffer.buffer;
			}
		}
		
		/** @type {boolean} */
		get isSignedInt() {
			return false;
		}
		
		
		
		
		
		
		/**
		 * Detect whether the given object implements the BinarizedInt interface or not
		 *
		 * @returns {Boolean}
		**/
		static IsBinarizedInt(input) {
			if ( !Binarized.IsBinarized() ) return false;
			return input.hasOwnProperty('isSignedInt');
		};
		
		
		
		[Symbol.toPrimitive](hint) {
			if( hint === 'string' ){
				return this.toString(10);
			}
			
			return this._ta[0];
		}
	}
	exports.BinarizedInt = BinarizedInt;
})((typeof window !== "undefined") ? window : (typeof module !== "undefined" ? module.exports : {}));
