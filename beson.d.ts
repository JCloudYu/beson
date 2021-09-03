declare type TypedArray = Uint8Array|Uint8ClampedArray|Int8Array|Uint16Array|Int16Array|Uint32Array|Int32Array|Float32Array|Float64Array;

declare type BinartIntLike<T> = T|BinaryIntBase|number|string;
declare class BinaryIntBase {
	_ab: ArrayBuffer;
	_ba: Uint8Array;
	_ta: TypedArray;

	isSignedInt:boolean;
	isBinaryInt():boolean;
}
declare class BinaryInt<T> extends BinaryIntBase {
	rshift(offset:number):T;
	lshift(offset:number):T;
	not():T;
	or(value:BinartIntLike<T>):T;
	and(value:BinartIntLike<T>):T;
	xor(value:BinartIntLike<T>):T;

	mul(value:BinartIntLike<T>):T;
	multipliedBy(value:BinartIntLike<T>):T;
	div(value:BinartIntLike<T>):T;
	dividedBy(value:BinartIntLike<T>):T;
	add(value:BinartIntLike<T>):T;
	sub(value:BinartIntLike<T>):T;
	modulo(value:BinartIntLike<T>):T;
	mod(value:BinartIntLike<T>):T;
	compare(value:BinartIntLike<T>):boolean;
	isZero():boolean;
	toBytes():Uint8Array;
	toString():string;
}

export function Serialize(data:any):Uint8Array;
export function Deserialize(data:ArrayBuffer|Uint8Array);
export class Int8 extends BinaryInt<Int8>  {
	static from(data:any):Int8;
	static ZERO:Int8;
	static MIN:Int8;
	static MAX:Int8;
}
export class UInt8 extends BinaryInt<UInt8> {
	static from(data:any):Int8;
	static ZERO:Int8;
	static MAX:Int8;
}
export class Int16 extends BinaryInt<Int16> {
	static from(data:any):Int16;
	static ZERO:Int16;
	static MIN:Int16;
	static MAX:Int16;
}
export class UInt16 extends BinaryInt<UInt16> {
	static from(data:any):UInt16;
	static ZERO:UInt16;
	static MAX:UInt16;
}
export class Int32 extends BinaryInt<Int32> {
	static from(data:any):Int32;
	static ZERO:Int32;
	static MIN:Int32;
	static MAX:Int32;
}
export class UInt32 extends BinaryInt<UInt32> {
	static from(data:any):UInt32;
	static ZERO:UInt32;
	static MAX:UInt32;
}
export class Float32 extends BinaryInt<Float32> {
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
export class Int64 extends BinaryInt<Int64> {
	static from(data:any):Int64;
	static ZERO:Int64;
	static MIN:Int64;
	static MAX:Int64;
}
export class UInt64 extends BinaryInt<UInt64> {
	static from(data:any):UInt64;
	static ZERO:UInt64;
	static MAX:UInt64;
}
export class Int128 extends BinaryInt<Int128> {
	static from(data:any):Int128;
	static ZERO:Int128;
	static MIN:Int128;
	static MAX:Int128;
}
export class UInt128 extends BinaryInt<UInt128> {
	static from(data:any):UInt128;
	static ZERO:UInt128;
	static MAX:UInt128;
}
export class Int256 extends BinaryInt<Int256> {
	static from(data:any):Int256;
	static ZERO:Int256;
	static MIN:Int256;
	static MAX:Int256;
}
export class UInt256 extends BinaryInt<UInt256> {
	static from(data:any):UInt256;
	static ZERO:UInt256;
	static MAX:UInt256;
}
export class Int512 extends BinaryInt<Int512> {
	static from(data:any):Int512;
	static ZERO:Int512;
	static MIN:Int512;
	static MAX:Int512;
}
export class UInt512 extends BinaryInt<UInt512> {
	static from(data:any):UInt512;
	static ZERO:UInt512;
	static MAX:UInt512;
}
export class IntVar extends BinaryInt<IntVar> {
	static from(data:any):IntVar;
	static ZERO(size:number):IntVar;
	static MIN(size:number):IntVar;
	static MAX(size:number):IntVar;
}
export class UIntVar extends BinaryInt<UIntVar> {
	static from(data:any):IntVar;
	static ZERO(size:number):IntVar;
	static MAX(size:number):IntVar;
}