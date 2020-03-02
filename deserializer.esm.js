/**
 *	Author: JCloudYu
 *	Create: 2019/09/18
**/
import {DeserializeBuffer} from "./deserialize.esm.js";
import {MergeArrayBuffers} from "./helper.esm.js";



const _PRIVATES = new WeakMap();
//@export=deserializer
const EMPTY_BUFFER = new Uint8Array(new ArrayBuffer(0));
class Deserializer {
	constructor() {
		_PRIVATES.set(this, { buffer:EMPTY_BUFFER });
		
		this.throw_if_error = false;
	}
	read() {
		const that = _PRIVATES.get(this);
		const result = DeserializeBuffer(that.buffer);
		
		if ( result === undefined ) {
			if ( this.throw_if_error ) {
				throw new TypeError( "Data stored in Deserializer is not encoded in valid beson format" );
			}
			
			return undefined;
		}
		else
		if ( result === false ) {
			return undefined;
		}
		else {
			const {anchor, value} = result;
			that.buffer = that.buffer.slice(anchor);
			return value;
		}
	}
	append(input_buffer) {
		if ( ArrayBuffer.isView(input_buffer) ) {
			input_buffer = input_buffer.buffer;
		}
		
		if ( !(input_buffer instanceof ArrayBuffer) ) {
			throw new TypeError( "Given buffer is not an ArrayBuffer!" );
		}
	
		const that = _PRIVATES.get(this);
		that.buffer = new Uint8Array(MergeArrayBuffers(that.buffer.buffer, input_buffer));
		
		
		
		return this;
	}
	get size() {
		return _PRIVATES.get(this).buffer.length;
	}
	get buffer() {
		return _PRIVATES.get(this).buffer.slice(0).buffer;
	}
	
	
	
	static init(input_buffer=null) {
		const deserializer = new Deserializer();
		if ( input_buffer === null ) {
			input_buffer = EMPTY_BUFFER
		}
		
		deserializer.append(input_buffer);
		
		return deserializer;
	}
}
//@endexport

export {Deserializer};
