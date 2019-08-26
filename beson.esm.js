/**
 *	Author: JCloudYu
 *	Create: 2019/08/22
**/
export const ___IS_LITTLE_ENDIAN = (new Uint8Array(Uint16Array.from([0x1234])))[0] === 0x34;
if ( !___IS_LITTLE_ENDIAN ) {
	throw new Error( "Beson only supports little endian environment!" )
}


import {Serialize} from "./serialize.esm.js";
import {Deserialize} from "./deserialize.esm.js";
import {
	Int8, Int16, Int32, Int64, Int128, Float32,
	UInt8, UInt16, UInt32, UInt64, UInt128,
	Binary, Int256, Int512, UInt256, UInt512,
	IntVar, UIntVar
} from "./beson-types.esm.js";

export const Beson = Object.freeze({
	Serialize, Deserialize,
	
	Int8, Int16, Int32, Int64, Int128, Float32,
	UInt8, UInt16, UInt32, UInt64, UInt128,
	Binary, Int256, Int512, UInt256, UInt512,
	IntVar, UIntVar
});
