import {HAS_NODE_BUFFER, DATA_TYPE, TYPE_HEADER, UTF8Decode} from "./helper.esm.js";
import {
	Int8, Int16, Int32, Int64, Int128,
	UInt8, UInt16, UInt32, UInt64, UInt128,
	Binary, Int256, Int512, UInt256, UInt512,
	IntVar, UIntVar, Float32
} from "./beson-types.esm.js";


export function Deserialize(buffer) {
	const result = _deserialize(buffer, 0);
	if ( result === undefined ) {
		throw new TypeError('Wrong data format');
	}
	
	return result.value;
}
export function _deserialize(buffer, anchor=0) {
	if ( HAS_NODE_BUFFER ) {
		if ( buffer instanceof Buffer ) {
			let buff = Buffer.alloc(buffer.length);
			buffer.copy(buff, 0);
			buffer = buff.buffer;
		}
	}
	
	let value;
	({ anchor, value } = __deserializeContent(buffer, anchor));
	return (value === undefined) ? undefined : {value, anchor};
}



function __deserializeContent(buffer, start) {
	let type, data;
	({ anchor: start, value: type } = __deserializeType(buffer, start));
	({ anchor: start, value: data } = __deserializeData(type, buffer, start));
	return { anchor: start, value: data };
}
function __deserializeType(buffer, start) {
	let length = 2;
	let end = start + length;
	let type = null;

	
	if ( (buffer.byteLength - start) >= length ) {
		let typeData = new Uint8Array(buffer, start, length);
		Object.entries(TYPE_HEADER).forEach(([headerKey, headerVal]) => {
			let headerData = new Uint8Array(headerVal);
			if ((typeData[0] === headerData[0]) && (typeData[1] === headerData[1])) {
				type = headerKey.toLowerCase();
			}
		});
	}
	return { anchor: end, value: type };
}
function __deserializeData(type, buffer, start) {
	let result = {anchor:start, value:undefined};
	if (type === DATA_TYPE.NULL) {
		result = __deserializeNull(start, );
	}
	else if (type === DATA_TYPE.FALSE || type === DATA_TYPE.TRUE) {
		result = __deserializeBoolean(type, start, );
	}
	else if (type === DATA_TYPE.INT8) {
		result = __deserializeInt8(buffer, start, );
	}
	else if (type === DATA_TYPE.INT16) {
		result = __deserializeInt16(buffer, start, );
	}
	else if (type === DATA_TYPE.INT32) {
		result = __deserializeInt32(buffer, start, );
	}
	else if (type === DATA_TYPE.INT64) {
		result = __deserializeInt64(buffer, start, );
	}
	else if (type === DATA_TYPE.INT128) {
		result = __deserializeInt128(buffer, start, );
	}
	else if (type === DATA_TYPE.INT256) {
		result = __deserializeInt256(buffer, start, );
	}
	else if (type === DATA_TYPE.INT512) {
		result = __deserializeInt512(buffer, start, );
	}
	else if (type === DATA_TYPE.INTVAR) {
		result = __deserializeIntVar(buffer, start, );
	}
	else if (type === DATA_TYPE.UINT8) {
		result = __deserializeUInt8(buffer, start, );
	}
	else if (type === DATA_TYPE.UINT16) {
		result = __deserializeUInt16(buffer, start, );
	}
	else if (type === DATA_TYPE.UINT32) {
		result = __deserializeUInt32(buffer, start, );
	}
	else if (type === DATA_TYPE.UINT64) {
		result = __deserializeUInt64(buffer, start, );
	}
	else if (type === DATA_TYPE.UINT128) {
		result = __deserializeUInt128(buffer, start, );
	}
	else if (type === DATA_TYPE.UINT256) {
		result = __deserializeUInt256(buffer, start, );
	}
	else if (type === DATA_TYPE.UINT512) {
		result = __deserializeUInt512(buffer, start, );
	}
	else if (type === DATA_TYPE.UINTVAR) {
		result = __deserializeUIntVar(buffer, start, );
	}
	else if (type === DATA_TYPE.FLOAT32) {
		result = __deserializeFloat32(buffer, start, );
	}
	else if (type === DATA_TYPE.FLOAT64) {
		result = __deserializeFloat64(buffer, start, );
	}
	else if (type === DATA_TYPE.STRING) {
		result = __deserializeString(buffer, start, );
	}
	else if (type === DATA_TYPE.ARRAY) {
		result = __deserializeArray(buffer, start, );
	}
	else if (type === DATA_TYPE.ARRAY_START) {
		result = __deserializeArrayStreaming(buffer, start, );
	}
	else if (type === DATA_TYPE.OBJECT) {
		result = __deserializeObject(buffer, start, );
	}
	else if (type === DATA_TYPE.OBJECT_START) {
		result = __deserializeObjectStreaming(buffer, start, );
	}
	else if (type === DATA_TYPE.DATE) {
		result = __deserializeDate(buffer, start, );
	}
	else if (type === DATA_TYPE.BINARY) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = Binary.from(result.value);
	}
	else if (type === DATA_TYPE.ARRAY_BUFFER) {
		result = __deserializeArrayBuffer(buffer, start, );
	}
	else if (type === DATA_TYPE.DATA_VIEW) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = new DataView(result.value);
	}
	else if (type === DATA_TYPE.UINT8_ARRAY) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = new Uint8Array(result.value);
	}
	else if (type === DATA_TYPE.INT8_ARRAY) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = new Int8Array(result.value);
	}
	else if (type === DATA_TYPE.UINT16_ARRAY) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = new Uint16Array(result.value);
	}
	else if (type === DATA_TYPE.INT16_ARRAY) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = new Int16Array(result.value);
	}
	else if (type === DATA_TYPE.UINT32_ARRAY) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = new Uint32Array(result.value);
	}
	else if (type === DATA_TYPE.INT32_ARRAY) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = new Int32Array(result.value);
	}
	else if (type === DATA_TYPE.FLOAT32_ARRAY) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = new Float32Array(result.value);
	}
	else if (type === DATA_TYPE.FLOAT64_ARRAY) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = new Float64Array(result.value);
	}
	else if (type === DATA_TYPE.SPECIAL_BUFFER) {
		result = __deserializeArrayBuffer(buffer, start, );
		result.value = HAS_NODE_BUFFER ? Buffer.from(result.value) : new Uint8Array(result.value);
	}
	
	return result;
}
function __deserializeNull(start) {
	return { anchor: start, value: null };
}
function __deserializeBoolean(type, start) {
	let end = start;
	let data = type === DATA_TYPE.TRUE;
	return { anchor: end, value: data };
}
function __deserializeInt8(buffer, start) {
	let end = start + 1;
	let dataView = new DataView(buffer);
	let data = dataView.getInt8(start);
	return { anchor: end, value:Int8.from(data) };
}
function __deserializeInt16(buffer, start) {
	let end = start + 2;
	let dataView = new DataView(buffer);
	let data = dataView.getInt16(start, true);
	return { anchor: end, value:Int16.from(data) };
}
function __deserializeInt32(buffer, start) {
	let end = start + 4;
	let dataView = new DataView(buffer);
	let data = dataView.getInt32(start, true);
	return { anchor: end, value:Int32.from(data) };
}
function __deserializeInt64(buffer, start) {
	let step = 4;
	let length = 2;
	let end = start + (step * length);
	let dataView = new DataView(buffer);
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint32(i, true));
	}
	let data = new Int64(new Uint32Array(dataArray));
	return { anchor: end, value: data };
}
function __deserializeInt128(buffer, start) {
	let step = 4;
	let length = 4;
	let end = start + (step * length);
	let dataView = new DataView(buffer);
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint32(i, true));
	}
	let data = new Int128(new Uint32Array(dataArray));
	return { anchor: end, value: data };
}
function __deserializeInt256(buffer, start) {
	let step = 4;
	let length = 8;
	let end = start + (step * length);
	let dataView = new DataView(buffer);
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint32(i, true));
	}
	let data = new Int256(new Uint32Array(dataArray));
	return { anchor: end, value: data };
}
function __deserializeInt512(buffer, start) {
	let step = 4;
	let length = 16;
	let end = start + (step * length);
	let dataView = new DataView(buffer);
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint32(i, true));
	}
	let data = new Int512(new Uint32Array(dataArray));
	return { anchor: end, value: data };
}
function __deserializeIntVar(buffer, start) {
	const dataBuff = new Uint8Array(buffer);
	if ( dataBuff[start] > 127 ) {
		throw new Error( "Cannot support IntVar whose size is greater than 127 bytes" );
	}
	
	
	
	let index = 0, data_size = dataBuff[start], end = start + 1;
	const result_buffer = new Uint8Array(data_size);
	while( data_size-- > 0 ) {
		result_buffer[index] = dataBuff[end];
		index++; end++;
	}


	let data = new IntVar(result_buffer);
	return { anchor: end, value: data };
}
function __deserializeUInt8(buffer, start) {
	let end = start + 1;
	let dataView = new DataView(buffer);
	let data = dataView.getUint8(start);
	return { anchor: end, value:UInt8.from(data) };
}
function __deserializeUInt16(buffer, start) {
	let end = start + 2;
	let dataView = new DataView(buffer);
	let data = dataView.getUint16(start, true);
	return { anchor: end, value:UInt16.from(data) };
}
function __deserializeUInt32(buffer, start) {
	let end = start + 4;
	let dataView = new DataView(buffer);
	let data = dataView.getUint32(start, true);
	return { anchor: end, value:UInt32.from(data) };
}
function __deserializeUInt64(buffer, start) {
	let step = 4;
	let length = 2;
	let end = start + (step * length);
	let dataView = new DataView(buffer);
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint32(i, true));
	}
	let data = new UInt64(new Uint32Array(dataArray));
	return { anchor: end, value: data };
}
function __deserializeUInt128(buffer, start) {
	let step = 4;
	let length = 4;
	let end = start + (step * length);
	let dataView = new DataView(buffer);
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint32(i, true));
	}
	let data = new UInt128(new Uint32Array(dataArray));
	return { anchor: end, value: data };
}
function __deserializeUInt256(buffer, start) {
	let step = 4;
	let length = 8;
	let end = start + (step * length);
	let dataView = new DataView(buffer);
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint32(i, true));
	}
	let data = new UInt256(new Uint32Array(dataArray));
	return { anchor: end, value: data };
}
function __deserializeUInt512(buffer, start) {
	let step = 4;
	let length = 16;
	let end = start + (step * length);
	let dataView = new DataView(buffer);
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint32(i, true));
	}
	let data = new UInt512(new Uint32Array(dataArray));
	return { anchor: end, value: data };
}
function __deserializeUIntVar(buffer, start) {
	const dataBuff = new Uint8Array(buffer);
	if ( dataBuff[start] > 127 ) {
		throw new Error( "Cannot support UIntVar whose size is greater than 127 bytes" );
	}
	
	
	
	let index = 0, data_size = dataBuff[start], end = start + 1;
	const result_buffer = new Uint8Array(data_size);
	while( data_size-- > 0 ) {
		result_buffer[index] = dataBuff[end];
		index++; end++;
	}


	let data = new UIntVar(result_buffer);
	return { anchor: end, value: data };
}
function __deserializeFloat32(buffer, start) {
	let end = start + 4;
	let dataView = new DataView(buffer);
	let data = dataView.getFloat32(start, true);
	return { anchor: end, value:Float32.from(data) };
}
function __deserializeFloat64(buffer, start) {
	let end = start + 8;
	let dataView = new DataView(buffer);
	let data = dataView.getFloat64(start, true);
	return { anchor: end, value: data };
}
function __deserializeString(buffer, start) {
	let step = 1;
	let dataView = new DataView(buffer);
	let length = dataView.getUint32(start, true);
	start += 4;
	let end = start + length;
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint8(i));
	}
	let data = UTF8Decode(Uint8Array.from(dataArray).buffer);
	return { anchor: end, value: data };
}
function __deserializeShortString(buffer, start) {
	let step = 1;
	let dataView = new DataView(buffer);
	let length = dataView.getUint16(start, true);
	start += 2;
	let end = start + length;
	let dataArray = [];
	for (let i = start; i < end; i += step) {
		dataArray.push(dataView.getUint8(i));
	}
	let data = UTF8Decode(Uint8Array.from(dataArray).buffer);
	return { anchor: end, value: data };
}
function __deserializeArray(buffer, start) {
	let dataView = new DataView(buffer);
	let length = dataView.getUint32(start, true);
	start += 4;
	let end = start + length;
	let data = [];
	while (start < end) {
		let subType, subData;
		({ anchor: start, value: subType } = __deserializeType(buffer, start));
		({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
		data.push(subData);
	}
	return { anchor: end, value: data };
}
function __deserializeArrayStreaming(buffer, start) {
	let end = start;
	let dataView = new DataView(buffer);
	let endData = new Uint16Array(TYPE_HEADER.ARRAY_END);
	let data = [];
	while (start < buffer.byteLength) {
		let tmpType = dataView.getUint16(start, true);
		if (tmpType === endData[0]) {
			end += 2;
			break;
		}
		
		let subType, subData;
		({ anchor: start, value: subType } = __deserializeType(buffer, start));
		({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
		data.push(subData);
		end = start;
	}
	return { anchor: end, value: data };
}
function __deserializeObject(buffer, start) {
	let dataView = new DataView(buffer);
	let length = dataView.getUint32(start, true);
	start += 4;
	let end = start + length;
	let data = {};
	while (start < end) {
		let subType, subKey, subData;
		({ anchor: start, value: subType } = __deserializeType(buffer, start));
		({ anchor: start, value: subKey } = __deserializeShortString(buffer, start));
		({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
		data[subKey] = subData;
	}
	return { anchor: end, value: data };
}
function __deserializeObjectStreaming(buffer, start) {
	let end = start;
	let dataView = new DataView(buffer);
	let endData = new Uint16Array(TYPE_HEADER.OBJECT_END);
	let data = {};
	while (start < buffer.byteLength) {
		let tmpType = dataView.getUint16(start, true);
		if (tmpType === endData[0]) {
			end += 2;
			break;
		}

		let subType, subKey, subData;
		({ anchor: start, value: subType } = __deserializeType(buffer, start));
		({ anchor: start, value: subKey } = __deserializeShortString(buffer, start));
		({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
		data[subKey] = subData;
		end = start;
	}
	return { anchor: end, value: data };
}
function __deserializeDate(buffer, start) {
	let end = start + 8;
	let dataView = new DataView(buffer);
	let data = new Date(dataView.getFloat64(start, true));
	return { anchor: end, value: data };
}
function __deserializeArrayBuffer(buffer, start) {
	let end = start + 4;
	let [length] = new Uint32Array(buffer.slice(start, end));
	
	end = end + length;
	return {anchor:end, value:buffer.slice(start+4, end)};
}
