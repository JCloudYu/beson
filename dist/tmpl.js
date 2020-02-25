
/**
 *	Author: Cheny
 *	Create: 2020/02/24
**/
module.exports = BuildTemplate
`(()=>{"use strict";
const writable=true, configurable=true, enumerable=false;
${'!beson'}
${'!helper'}
${'!BinaryData'}
${'!Binary'}
${'!BinarySmallNumber'}
${'!BinaryVariableLengthInt'}
${'!UInt64'}
${'!UInt128'}
${'!UInt256'}
${'!UInt512'}
${'!serialize'}
${'!Serializer'}
${'!deserialize'}
${'!deserializer'}

window.beson = {
    Int8,  Int16,  Int32,  Int64,  Int128,  Int256,  Int512,  IntVar,
	UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, UInt512, UIntVar,
    Float32,
    
    Deserialize, DeserializeBuffer,Deserializer,
    Serialize, Serializer
};
})(window);`;