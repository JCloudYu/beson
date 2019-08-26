import {Beson as BesonType} from "../beson.esm.js";
import {ConcatBuffers, UTF8Encode, UTF8Decode} from "../helper.esm.js";
import assert from "assert";
import crypto from "crypto";


const {Serialize, Deserialize} = BesonType;
const {Binary, Int8, Float32, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Int128, UInt128, Int256, UInt256, Int512, UInt512, IntVar, UIntVar} = BesonType;



const MIN_INT8 = -128;
const MAX_INT8 = 127;
const MAX_UINT8 = 0xFF;
const MIN_INT16 = -32768;
const MAX_INT16 = 32767;
const MAX_UINT16 = 0xFFFF;
const MIN_INT32 = -2147483648;
const MAX_INT32 = 2147483647;
const MAX_UINT32 = 0xFFFFFFFF;



test_group('beson testing', ()=>{
	test_group('beson Deserialize data is equal to original data', ()=>{
		unit_test('Null', ()=>{
			let original = null;
			let test = Deserialize(Serialize(original));
			assert(test === original);
		});
		unit_test('False', ()=>{
			let original = false;
			let test = Deserialize(Serialize(original));
			assert(test === original);
		});
		unit_test('True', ()=>{
			let original = true;
			let test = Deserialize(Serialize(original));
			assert(test === original);
		});
		unit_test('Int8 (positive object)', ()=>{
			let test = Deserialize(Serialize(Int8.MAX));
			assert(+test === +MAX_INT8);
		});
		unit_test('Int8 (negative object)', ()=>{
			let test = Deserialize(Serialize(Int8.MIN));
			assert(+test === +MIN_INT8);
		});
		unit_test('UInt8 (object)', ()=>{
			let test = Deserialize(Serialize(UInt8.MAX));
			assert(+test === +MAX_UINT8);
		});
		unit_test('Int16 (positive object)', ()=>{
			let test = Deserialize(Serialize(Int16.MAX));
			assert(+test === +MAX_INT16);
		});
		unit_test('Int16 (negative object)', ()=>{
			let test = Deserialize(Serialize(Int16.MIN));
			assert(+test === +MIN_INT16);
		});
		unit_test('UInt16 (object)', ()=>{
			let test = Deserialize(Serialize(UInt16.MAX));
			assert(+test === +MAX_UINT16);
		});
		unit_test('Int32 (positive object)', ()=>{
			let test = Deserialize(Serialize(Int32.MAX));
			assert(+test === +MAX_INT32);
		});
		unit_test('Int32 (negative object)', ()=>{
			let test = Deserialize(Serialize(Int32.MIN));
			assert(+test === +MIN_INT32);
		});
		unit_test('UInt32 (object)', ()=>{
			let test = Deserialize(Serialize(UInt32.MAX));
			assert(+test === +MAX_UINT32);
		});
		unit_test('Int64 (positive number)', ()=>{
			let original = Int64.MAX;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('Int64 (negative number)', ()=>{
			let original = Int64.MIN;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('UInt64', ()=>{
			let original = UInt64.MAX;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('Int128 (positive number)', ()=>{
			let original = Int128.MAX;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('Int128 (negative number)', ()=>{
			let original = Int128.MIN;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('UInt128', ()=>{
			let original = UInt128.MAX;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('Int256 (positive number)', ()=>{
			let original = Int256.MAX;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('Int256 (negative number)', ()=>{
			let original = Int256.MIN;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('UInt256', ()=>{
			let original = UInt256.MAX;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('Int512 (positive number)', ()=>{
			let original = Int512.MAX;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('Int512 (negative number)', ()=>{
			let original = Int512.MIN;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('UInt512', ()=>{
			let original = UInt512.MAX;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('Double', ()=>{
			let original = Math.PI;
			let test = Deserialize(Serialize(original));
			assert(test.toString() === original.toString());
		});
		unit_test('Float', ()=>{
			let original = Float32.MAX_INT;
			let test = Deserialize(Serialize(Float32.MAX_INT));
			assert(+test === +original);
		});
		unit_test('String', ()=>{
			let original = 'Hello World!!!';
			let test = Deserialize(Serialize(original));
			assert(test === original);
		});
		unit_test('Array', ()=>{
			let original = [true, 2147483647, Math.PI, {aaa: 2147483647, bbb: Math.PI}, [false, 'Hello World', new Date(1539838676247), Int128.MAX]];
			let test = Deserialize(Serialize(original));
			assert(stringifyObject(test) === stringifyObject(original));
		});
		unit_test('Object', ()=>{
			let original = {
				z: {
					c: 'aaa',
					b: false,
					a: 123
				},
				b: 123,
				a: new Date(1539838676247),
				_: Int128.MAX,
				PI: Math.PI,
				array: ['aaa', true, 123]
			};
			let test = Deserialize(Serialize(original));
			assert(stringifyObject(test) === stringifyObject(original));
		});
		unit_test('Set', ()=>{
			let array = [true, true, 2147483647, 2147483647, Math.PI, Math.PI, {aaa: 2147483647, bbb: Math.PI}, [false, 'Hello World', new Date(1539838676247), Int128.MAX]];
			let original = new Set(array);
			let test = Deserialize(Serialize(original));
			assert(test instanceof Set);
			
			let a = Array.from(original);
			let b = Array.from(test);
			assert(stringifyObject(a) === stringifyObject(b));
			assert(stringifyObject(a) !== stringifyObject(array));
		});
		unit_test('Map', ()=>{
			let original = new Map([
				['z', {
					c: 'aaa',
					b: false,
					a: 123
				}],
				['b', 123],
				['a', new Date(1539838676247)],
				['_', Int128.MAX],
				['PI', Math.PI],
				['array', ['aaa', true, 123]],
				[null, ['aaa', true, 123]],
				[false, ['aaa', true, 123]],
				[true, ['aaa', true, 123]],
				[123, ['aaa', true, 123]]
			]);
			let test = Deserialize(Serialize(original));
			
			let fail = false;
			for(let [k, v] of original) {
				fail = fail || (stringifyObject(test.get(k)) !== stringifyObject(v));
			}
			
			for(let [k, v] of test) {
				fail = fail || (stringifyObject(original.get(k)) !== stringifyObject(v));
			}
			
			assert(fail === false);
		});
		unit_test('Map - obj keys', ()=>{
			let original = new Map([
				['z', {
					c: 'aaa',
					b: false,
					a: 123
				}],
				['b', 123],
				['a', new Date(1539838676247)],
				['_', Int128.MAX],
				['PI', Math.PI],
				['array', ['aaa', true, 123]],
				[null, ['aaa', true, 123]],
				[false, ['aaa', true, 123]],
				[true, ['aaa', true, 123]],
				[123, ['aaa', true, 123]],
				[new Date(), ['aaa', true, 123]],
			]);
			let test = Deserialize(Serialize(original));
			
			let pass = false;
			for(let [k, v] of original) {
				pass = pass || (stringifyObject(test.get(k)) !== stringifyObject(v));
			}
			
			for(let [k, v] of test) {
				pass = pass || (stringifyObject(original.get(k)) !== stringifyObject(v));
			}
			
			assert(pass === true);
		});
		unit_test('Date', ()=>{
			let original = new Date(1539838676247);
			let test = Deserialize(Serialize(original));
			assert(test.getTime() === original.getTime());
		});
		unit_test('ArrayBuffer', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = raw_data.buffer;
			let test = Deserialize(Serialize(original));
			assert(test instanceof ArrayBuffer);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test);
			assert(a.toString() === b.toString());
		});
		unit_test('DataView', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new DataView(raw_data.buffer);
			let test = Deserialize(Serialize(original));
			assert(test instanceof DataView);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('Uint8Array', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new Uint8Array(raw_data.buffer);
			let test = Deserialize(Serialize(original));
			assert(test instanceof Uint8Array);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('Int8Array', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new Int8Array(raw_data.buffer);
			let test = Deserialize(Serialize(original));
			assert(test instanceof Int8Array);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('Uint16Array', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new Uint16Array(raw_data.buffer);
			let test = Deserialize(Serialize(original));
			assert(test instanceof Uint16Array);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('Int16Array', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new Int16Array(raw_data.buffer);
			let test = Deserialize(Serialize(original));
			assert(test instanceof Int16Array);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('Uint32Array', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new Uint32Array(raw_data.buffer);
			let test = Deserialize(Serialize(original));
			assert(test instanceof Uint32Array);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('Int32Array', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new Int32Array(raw_data.buffer);
			let test = Deserialize(Serialize(original));
			assert(test instanceof Int32Array);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('Float32Array', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new Float32Array(raw_data.buffer);
			let test = Deserialize(Serialize(original));
			assert(test instanceof Float32Array);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('Float64Array', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new Float64Array(raw_data.buffer);
			let test = Deserialize(Serialize(original));
			assert(test instanceof Float64Array);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('NodeJS Buffer', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let test = Deserialize(Serialize(raw_data));
			assert(test instanceof Buffer);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
		unit_test('Regular Expression', ()=>{
			const test_mail = "test.mail+google-style.style@gmail.a.b.c.com";
			const original = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   			const test = Deserialize(Serialize(original));
   			assert(test instanceof RegExp);
   			assert(original.source === test.source);
   			assert(original.flags === test.flags);
			assert(original.test(test_mail));
			assert(test.test(test_mail));
		});
		unit_test('Binary Interface', ()=>{
			const raw_data = Buffer.alloc(32);
			raw_data.set(crypto.randomBytes(32));
			
			let original = new Uint8Array(raw_data.buffer);
			
			
			let test = Deserialize(Serialize({toBytes(){
				return original;
			}}));
			assert(test instanceof Uint8Array);
			
			
			let a = Binary.from(raw_data.buffer);
			let b = Binary.from(test.buffer);
			assert(a.toString() === b.toString());
		});
	});
	test_group('UTF8 decode data is equal to original data', ()=>{
		unit_test('1-byte sequence', ()=>{
			let original = '7Bz^{';
			let test = UTF8Decode(UTF8Encode(original));
			assert(test === original);
		});
		unit_test('2-byte sequence', ()=>{
			let original = 'ƇݝπԪ֍';
			let test = UTF8Decode(UTF8Encode(original));
			assert(test === original);
		});
		unit_test('3-byte sequence', ()=>{
			let original = 'ぬ乺ឈㅎⓇ';
			let test = UTF8Decode(UTF8Encode(original));
			assert(test === original);
		});
		unit_test('4-byte sequence', ()=>{
			let original = '𠁝🜓🝣𐩸🤩';
			let test = UTF8Decode(UTF8Encode(original));
			assert(test === original);
		});
		unit_test('random chinese string', ()=>{
			let original = '南在物不弟操第，麼選長。向生於告許小對社問。出起象生子天高行資！統走到由，城師一子分機己兒連見上心心多不我會只也跟叫學集預聽臺時生車日。境聯特銷道我生人戲、痛回書不利告以格由人那球房謝行分學日或於景能用風：行麼做友雖、者切空選熱要，課子頭於一子必車公書港告別破飛笑銷，出來是，在張內聽：味山個獲往打夫力人電統。管少內。聲給的牛，醫識了知大之為，上我是注民量效度體音力……的位口足假省！了表工小人童當但方。獲定美話樣個！隨放我前人狀說上心商更山我深；集區解上出由手中素己中加行考！師本小以者。張了操花的中後眾性加人夜包寫立己中方爭們排己：盡去血為山醫是包著不十：結我法，題一感，化其士！他酒些！動顧運來來議，照能生達來。難的人起！一水也升羅叫為場全下雲地校為！野也斷名站，大指一通問可光物。得加為夫，現體印料合冷元一自起一場結價。國害出酒部夠知接配團只爭臺果。益策是：源故去師果皮我打老件……解民導愛多是；一半規什一自課留兒品水門念，問開們加和綠麼低東通實專讀問心民受原了跑上就得此成異務國裡命道以樣正高場。職出聲這；然動愛神未他一在快民找行像見太著我個獲事日口保，長展土，道通門智。票登電羅費權我我風字王理接要利始香善先冷人子那老不常魚了；通書人成本更，景中拉帶主，的他個整自我打灣個不相長，公出回學致去得：這裡身也工國問市在子什電計。人可不，當觀務力思是愛，必他灣打別說信的的角加什難大消當他就；長了府人！跟然破際士、頭神受；道亞一年皮灣兒開能現城會這車人。影生軍，無開做客才視麼作去華阿女，便部個？經功動加有和心童，的的理說境一晚行實頭血新學師像國：品不聲的國民來急四了型北少極常心。以又好生動唱日覺社車體要時氣本真日感如說馬院無，習大作他一越長辦。外有原！子個很便熱像如；女檢臉……利的就則金。年東長。自它走油雲驚一現夠黃力看來他細便參一道修上什利為現母，明阿義相接進半形常時開不時方是西對成理帶一目信就驗十，公龍的土山得多著媽臺那、西不金可地關列是想委，設中園高接不本且須如把國友燈色？比的電灣天葉系拉個自初時、技文關史音你化爸！我的常考以山長那，是什計了寫中為法在有：平要的之被父這臺場寫成單戲的反功險你到會，年日安地信平提縣史企務選從發己資……的國不，開不縣水作像落快了代減爾……北定密歡的別們，登樣際，不很美然館長小個如工我準決。節時點行家古體定……交人高了話資聽進教性負正自有以比回院苦教然，院連史去應史學藥三孩能笑大精心積請有地題知又；來父與微實分開產安題師我許興手形南和球，支辦國了任者並議一引國此。收我心去度留。代在心政臺其四設有心！提星專畫因皮。形魚不班案；望笑以。些面他，時在作、真際球進得木皮的動營放，人市最十放來公了新；進告市陸但是不能化所強政家每故生。今銀令。不電因在已於氣，什位團……素止身，不談文中要：界才走的義，天名許何不美做手歷們辦應意立找海講已急友約有美的留我代。';
			let test = UTF8Decode(UTF8Encode(original));
			assert(test === original);
		});
	});
});

function stringifyObject(input){
	return JSON.stringify(input);
}
