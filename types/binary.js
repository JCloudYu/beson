/**
 *	Author: JCloudYu
 *	Create: 2018/10/23
**/
((exports)=>{
	"use strict";
	
	const _WEAK_MAP = new WeakMap();
	class Binary {
		constructor() {
			const _PRIVATES = {
				_buff:new ArrayBuffer(0)
			};
			_WEAK_MAP.set(this, _PRIVATES);
		}
		get size() {
			return _WEAK_MAP.get(this)._buff.byteLength;
		}
		get _raw_buffer() {
			return _WEAK_MAP.get(this)._buff;
		}
		get buffer() {
			return this.toBytes();
		}
		toBytes() {
			return _WEAK_MAP.get(this)._buff.slice(0);
		}
		slice(...args) {
			return _WEAK_MAP.get(this)._buff.slice(...args);
		}
		append(...segments) {
			let _PRIVATE = _WEAK_MAP.get(this);
			let totalLength = _PRIVATE._buff.byteLength;
			let buffers = [];
			for(let seg of segments) {
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
			newInst.set(new Uint8Array(_PRIVATE._buff), offset);
			offset += _PRIVATE._buff.byteLength;
			
			for(let seg of buffers) {
				newInst.set(new Uint8Array(seg), offset);
				offset += seg.byteLength;
			}
			
			_PRIVATE._buff = newInst.buffer;
		}
		resize(length) {
			if ( typeof length !== "number" ) {
				throw new TypeError( "Given argument should be a number!" );
			}
			
			if ( length < 0 ) {
				throw new TypeError( "length should be equal to or greater than zero!" );
			}
			
			
			if ( typeof length !== "number" ) {
				throw new TypeError( "Given argument should be a number!" );
			}
			
			if ( length < 0 ) {
				throw new TypeError( "length should be equal to or greater than zero!" );
			}
			
			let _PRIVATE = _WEAK_MAP.get(this);
			let {_buff} = _PRIVATE;
			if ( length === _buff.byteLength ) {
				return;
			}
			else
			if ( length < _buff.byteLength ) {
				_buff = _buff.slice(0, length);
			}
			
			
			let buffer = new Uint8Array(length);
			buffer.set(new Uint8Array(_buff), 0);
			
			_PRIVATE._buff = buffer.buffer;
		}
		static from(...segments) {
			let bin = new Binary();
			bin.append(...segments);
			return bin;
		}
	}
	
	exports.Binary = Binary;
})((typeof window !== "undefined") ? window : (typeof module !== "undefined" ? module.exports : {}));
