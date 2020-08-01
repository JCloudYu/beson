/**
 *	Author: JCloudYu
 *	Create: 2019/09/18
**/
import {SerializeData} from "src/serialize.esm.js";
import {MergeArrayBuffers} from "src/helper.esm.js";


//@export=Serializer
const _PRIVATES = new WeakMap();
class Serializer {
	constructor() {
		const parts = [];
		_PRIVATES.set(this, {
			parts:parts,
			data_cb:(chunk)=>{
				parts.push(chunk);
			}
		});
	}
	write(data) {
		const that = _PRIVATES.get(this);
		SerializeData(data, that.data_cb);
		return this;
	}
	get size() {
		const {parts} = _PRIVATES.get(this);
		let length=0;
		for(const part of parts) {
			length += part.byteLength;
		}
		return length;
	}
	get buffer() {
		return MergeArrayBuffers(_PRIVATES.get(this).parts);
	}
	
	
	
	static init() {
		return new Serializer();
	}
}
//@endexport

export {Serializer};
