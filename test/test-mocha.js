(() => {
    'use strict';

    const stringifyObject = require('stringify-object');
    const { Serialize, Deserialize } = require('../beson');
    const { ObjectId, Binary, Int64, UInt64, Int128, UInt128 } = require('../beson');
    const { UTF8Encode, UTF8Decode } = require('../beson').Helper;
	
    const assert = require( 'assert' );
    describe('beson testing', () => {
        describe('beson deserialize data is equal to origin data', () => {
            it('Null', () => {
                let origin = null;
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });
            
            it('False', () => {
                let origin = false;
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });

            it('True', () => {
                let origin = true;
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });

            it('Int32', () => {
                let origin = 2147483647;
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });

            it('Int64 (positive number)', () => {
                let origin = Int64.from(Int64.MAX);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Int64 (negative number)', () => {
                let origin = Int64.from(Int64.MIN);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Int128 (positive number)', () => {
                let origin = Int128.from(Int128.MAX);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Int128 (negative number)', () => {
                let origin = Int128.from(Int128.MIN);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('UInt64', () => {
                let origin = UInt64.from(UInt64.MAX);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('UInt128', () => {
                let origin = UInt128.from(UInt128.MAX);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Double', () => {
                let origin = Math.PI;
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('String', () => {
                let origin = 'Hello World!!!';
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });

            it('Array', () => {
                let origin = [true, 2147483647, Math.PI, { aaa: 2147483647, bbb: Math.PI }, [false, 'Hello World', new Date(1539838676247), Int128.from(Int128.MAX)]];
                let test = Deserialize(Serialize(origin));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Array (streaming)', () => {
                let origin = [true, 2147483647, Math.PI, { aaa: 2147483647, bbb: Math.PI }, [false, 'Hello World', new Date(1539838676247), Int128.from(Int128.MAX)]];
                let test = Deserialize(Serialize(origin, { streaming_array: true }));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Array (streaming + append binary origin)', () => {
                let origin = [true, 2147483647, Math.PI, { aaa: 2147483647, bbb: Math.PI }, [false, 'Hello World', new Date(1539838676247), Int128.from(Int128.MAX)]];
                let buffer = Serialize(origin, { streaming_array: true });
                let test = Deserialize(__arrayBufferConcat([buffer, new Uint8Array([123, 45, 67, 89]).buffer]));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Object', () => {
                let origin = {
                    z: {
                        c: 'aaa',
                        b: false,
                        a: 123
                    },
                    b: 123,
                    a: new Date(1539838676247),
                    _: Int128.from(Int128.MAX),
                    PI: Math.PI,
                    array: ['aaa', true, 123]
                };
                let test = Deserialize(Serialize(origin));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Object (sort key)', () => {
                const origin1 = {
                    z: {
                        c: 'aaa',
                        b: false,
                        a: 123
                    },
                    b: 123,
                    a: new Date(1539838676247),
                    _: Int128.from(Int128.MAX),
                    PI: Math.PI,
                    array: ['aaa', true, 123]
                };
                const origin2 = {
                    z: {
                        c: 'aaa',
                        b: false,
                        a: 123
                    },
                    PI: Math.PI,
                    array: ['aaa', true, 123],
                    a: new Date(1539838676247),
                    _: Int128.from(Int128.MAX),
                    b: 123
                };
                const test1 = Deserialize(Serialize(origin1, { sort_key: true }));
                const test2 = Deserialize(Serialize(origin2, { sort_key: true }));
                assert(stringifyObject(test1) === stringifyObject(test2));
            });

            it('Object (streaming)', () => {
                let origin = {
                    z: {
                        c: 'aaa',
                        b: false,
                        a: 123
                    },
                    b: 123,
                    a: new Date(1539838676247),
                    _: Int128.from(Int128.MAX),
                    PI: Math.PI,
                    array: ['aaa', true, 123]
                };
                const test = Deserialize(Serialize(origin, { streaming_object: true }));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Object (streaming + append binary origin)', () => {
                let origin = {
                    z: {
                        c: 'aaa',
                        b: false,
                        a: 123
                    },
                    b: 123,
                    a: new Date(1539838676247),
                    _: Int128.from(Int128.MAX),
                    PI: Math.PI,
                    array: ['aaa', true, 123]
                };
                let buffer = Serialize(origin, { streaming_object: true });
                let test = Deserialize(__arrayBufferConcat([buffer, new Uint8Array([123, 45, 67, 89]).buffer]));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Date', () => {
                let origin = new Date(1539838676247);
                let test = Deserialize(Serialize(origin));
                assert(test.getTime() === origin.getTime());
            });

            it('ObjectId', () => {
                let origin = new ObjectId();
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Binary', () => {
                let origin = Binary.from(Serialize(new ObjectId()));
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });
        });

        describe('UTF8 decode data is equal to origin data', () => {
            it('1-byte sequence', () => {
                let origin = 'B^{';
                let test = UTF8Decode(UTF8Encode(origin));
                assert(test === origin);
            });

            it('2-byte sequence', () => {
                let origin = 'Ƈݝπ';
                let test = UTF8Decode(UTF8Encode(origin));
                assert(test === origin);
            });

            it('3-byte sequence', () => {
                let origin = '乺ឈﬗ';
                let test = UTF8Decode(UTF8Encode(origin));
                assert(test === origin);
            });

            it('4-byte sequence', () => {
                let origin = '𠁝🜓🝣';
                let test = UTF8Decode(UTF8Encode(origin));
                assert(test === origin);
            });

            it('random chinese string', () => {
                let origin = '南在物不弟操第，麼選長。向生於告許小對社問。出起象生子天高行資！統走到由，城師一子分機己兒連見上心心多不我會只也跟叫學集預聽臺時生車日。境聯特銷道我生人戲、痛回書不利告以格由人那球房謝行分學日或於景能用風：行麼做友雖、者切空選熱要，課子頭於一子必車公書港告別破飛笑銷，出來是，在張內聽：味山個獲往打夫力人電統。管少內。聲給的牛，醫識了知大之為，上我是注民量效度體音力……的位口足假省！了表工小人童當但方。獲定美話樣個！隨放我前人狀說上心商更山我深；集區解上出由手中素己中加行考！師本小以者。張了操花的中後眾性加人夜包寫立己中方爭們排己：盡去血為山醫是包著不十：結我法，題一感，化其士！他酒些！動顧運來來議，照能生達來。難的人起！一水也升羅叫為場全下雲地校為！野也斷名站，大指一通問可光物。得加為夫，現體印料合冷元一自起一場結價。國害出酒部夠知接配團只爭臺果。益策是：源故去師果皮我打老件……解民導愛多是；一半規什一自課留兒品水門念，問開們加和綠麼低東通實專讀問心民受原了跑上就得此成異務國裡命道以樣正高場。職出聲這；然動愛神未他一在快民找行像見太著我個獲事日口保，長展土，道通門智。票登電羅費權我我風字王理接要利始香善先冷人子那老不常魚了；通書人成本更，景中拉帶主，的他個整自我打灣個不相長，公出回學致去得：這裡身也工國問市在子什電計。人可不，當觀務力思是愛，必他灣打別說信的的角加什難大消當他就；長了府人！跟然破際士、頭神受；道亞一年皮灣兒開能現城會這車人。影生軍，無開做客才視麼作去華阿女，便部個？經功動加有和心童，的的理說境一晚行實頭血新學師像國：品不聲的國民來急四了型北少極常心。以又好生動唱日覺社車體要時氣本真日感如說馬院無，習大作他一越長辦。外有原！子個很便熱像如；女檢臉……利的就則金。年東長。自它走油雲驚一現夠黃力看來他細便參一道修上什利為現母，明阿義相接進半形常時開不時方是西對成理帶一目信就驗十，公龍的土山得多著媽臺那、西不金可地關列是想委，設中園高接不本且須如把國友燈色？比的電灣天葉系拉個自初時、技文關史音你化爸！我的常考以山長那，是什計了寫中為法在有：平要的之被父這臺場寫成單戲的反功險你到會，年日安地信平提縣史企務選從發己資……的國不，開不縣水作像落快了代減爾……北定密歡的別們，登樣際，不很美然館長小個如工我準決。節時點行家古體定……交人高了話資聽進教性負正自有以比回院苦教然，院連史去應史學藥三孩能笑大精心積請有地題知又；來父與微實分開產安題師我許興手形南和球，支辦國了任者並議一引國此。收我心去度留。代在心政臺其四設有心！提星專畫因皮。形魚不班案；望笑以。些面他，時在作、真際球進得木皮的動營放，人市最十放來公了新；進告市陸但是不能化所強政家每故生。今銀令。不電因在已於氣，什位團……素止身，不談文中要：界才走的義，天名許何不美做手歷們辦應意立找海講已急友約有美的留我代。';
                let test = UTF8Decode(UTF8Encode(origin));
                assert(test === origin);
            });
        });
    });

    function __arrayBufferConcat(arrays) {
        let totalLength = 0;
        for (const arr of arrays) {
            totalLength += arr.byteLength;
        }
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const arr of arrays) {
            result.set(new Uint8Array(arr), offset);
            offset += arr.byteLength;
        }
        return result.buffer;
    }
})();
