
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

let exports;
if ( (typeof module !== "undefined") && module.exports ) {
	exports = module.exports;
}
else
if ( typeof window !== "undefined" ) {
	exports = window.beson = window.Beson = window.Beson||{};
}


const Misc = {};
Object.defineProperties(Misc, {
	'DeserializeBuffer':{value:DeserializeBuffer, enumerable:true},
	'Deserializer':{value:Deserializer, enumerable:true},
	'Serializer':{value:Serializer, enumerable:true},
	
	'UTF8Encode':{value:UTF8Encode, enumerable:true},
	'UTF8Decode':{value:UTF8Decode, enumerable:true}
});
Object.defineProperties(exports, {
	'BinaryData': {value:BinaryData, enumerable:true},
	'BinaryInt': {value:BinaryInt, enumerable:true},

	'Int8':{value:Int8, enumerable:true},
	'Int16':{value:Int16, enumerable:true},
	'Int32':{value:Int32, enumerable:true},
	'Int64':{value:Int64, enumerable:true},
	'Int128':{value:Int128, enumerable:true},
	'Int256':{value:Int256, enumerable:true},
	'Int512':{value:Int512, enumerable:true},
	'IntVar':{value:IntVar, enumerable:true},
	
	'UInt8':{value:UInt8, enumerable:true},
	'UInt16':{value:UInt16, enumerable:true},
	'UInt32':{value:UInt32, enumerable:true},
	'UInt64':{value:UInt64, enumerable:true},
	'UInt128':{value:UInt128, enumerable:true},
	'UInt256':{value:UInt256, enumerable:true},
	'UInt512':{value:UInt512, enumerable:true},
	'UIntVar':{value:UIntVar, enumerable:true},
	
	'Float32':{value:Float32, enumerable:true},
	
	'Deserialize':{value:Deserialize, enumerable:true},
	'Serialize':{value:Serialize, enumerable:true},
	'Misc':{value:Misc, enumerable:true}
});
})();`;
