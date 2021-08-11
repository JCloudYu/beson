declare type TypedArray = Uint8Array|Uint8ClampedArray|Int8Array|Uint16Array|Int16Array|Uint32Array|Int32Array|Float32Array|Float64Array;

declare class BinaryInt {
	_ab: ArrayBuffer;
	_ba: Uint8Array;
	_ta: TypedArray;

	isSignedInt:boolean;
}

export function Serialize(data:any):Uint8Array;
export function Deserialize(data:ArrayBuffer|Uint8Array);
export class Int8 extends BinaryInt {
	static from(data:any):Int8;
	static ZERO:Int8;
	static MIN:Int8;
	static MAX:Int8;
}
export class UInt8 extends BinaryInt {
	static from(data:any):Int8;
	static ZERO:Int8;
	static MAX:Int8;
}
export class Int16 extends BinaryInt {
	static from(data:any):Int16;
	static ZERO:Int16;
	static MIN:Int16;
	static MAX:Int16;
}
export class UInt16 extends BinaryInt {
	static from(data:any):UInt16;
	static ZERO:UInt16;
	static MAX:UInt16;
}
export class Int32 extends BinaryInt {
	static from(data:any):Int32;
	static ZERO:Int32;
	static MIN:Int32;
	static MAX:Int32;
}
export class UInt32 extends BinaryInt {
	static from(data:any):UInt32;
	static ZERO:UInt32;
	static MAX:UInt32;
}
export class Float32 extends BinaryInt {
	static from(value:any):Float32;
	static ZERO:Float32;
	static NaN:Float32;
	static MAX_INFINITY:Float32;
	static MIN_INFINITY:Float32;
	static MAX_INT:Float32;
	static MIN_INT:Float32;
	static MAX:Float32;
	static MIN:Float32;
}
export class Int64 extends BinaryInt {
	static from(data:any):Int64;
	static ZERO:Int64;
	static MIN:Int64;
	static MAX:Int64;
}
export class UInt64 extends BinaryInt {
	static from(data:any):UInt64;
	static ZERO:UInt64;
	static MAX:UInt64;
}
export class Int128 extends BinaryInt {
	static from(data:any):Int128;
	static ZERO:Int128;
	static MIN:Int128;
	static MAX:Int128;
}
export class UInt128 extends BinaryInt {
	static from(data:any):UInt128;
	static ZERO:UInt128;
	static MAX:UInt128;
}
export class Int256 extends BinaryInt {
	static from(data:any):Int256;
	static ZERO:Int256;
	static MIN:Int256;
	static MAX:Int256;
}
export class UInt256 extends BinaryInt {
	static from(data:any):UInt256;
	static ZERO:UInt256;
	static MAX:UInt256;
}
export class Int512 extends BinaryInt {
	static from(data:any):Int512;
	static ZERO:Int512;
	static MIN:Int512;
	static MAX:Int512;
}
export class UInt512 extends BinaryInt {
	static from(data:any):UInt512;
	static ZERO:UInt512;
	static MAX:UInt512;
}
export class IntVar extends BinaryInt {
	static from(data:any):IntVar;
	static ZERO(size:number):IntVar;
	static MIN(size:number):IntVar;
	static MAX(size:number):IntVar;
}
export class UIntVar extends BinaryInt {
	static from(data:any):IntVar;
	static ZERO(size:number):IntVar;
	static MAX(size:number):IntVar;
}