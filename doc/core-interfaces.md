# Beson Core Interfaces #
Following interfaces are core types defined and used internally by Beson for dynamic type conversions.

## Binarized ##
```javascript
class Binarized {
    _ab:ArrayBuffer;
    _ba:Uint8Array;
    toBytes(size:Number=null):ArrayBuffer;
    toString(bits:Number=16):String
    
    static IsBinarized(input:any);
}
```

## BinarizedInt ##
```javascript
class BinarizedInt extends Binarized {
    isSignedInt:Boolean,
    
    static IsBinarizedInt(input:any);
}
```

## Relations among Core Types ##
```uml
@startuml
Interface Binarized {
    +_ab:ArrayBuffer
    +_ba:UInt8Array
    
    +size:Number
    
    +toBytes(size:Number=null):ArrayBuffer
    +toString(bits:Number=16):String
    +compare(other:Binarized):Boolean
    
    +__set_ab(array_buffer:ArrayBuffer):Binarized
    
    {static} +IsBinarized(input:Any):Boolean
}

Interface BinarizedInt {
    +_ta:TypedArray
    +isSignedInt:Boolean
    +isPositive:Boolean
    
    +toBytes():ArrayBuffer
    +compare(other:BinarizedInt):Boolean
    +lshift():BinarizedInt
    
    {static} +IsBinarizedInt(input:Any):Boolean
}

Binarized <|.. BinarizedInt
BinarizedInt <|.. UInt8
BinarizedInt <|.. Int8
BinarizedInt <|.. UInt16
BinarizedInt <|.. Int16
BinarizedInt <|.. UInt32
BinarizedInt <|.. Int32
BinarizedInt <|.. UInt64
BinarizedInt <|.. Int64
BinarizedInt <|.. UInt128
BinarizedInt <|.. Int128

Binarized <|.. Binary
Binarized <|.. ObjectId
@enduml
```