# BESON - Binary Extended JSON #
## Syntax ##
```
int8        8-bits signed integer
uint8       8-bits unsigned integer
int32       32-bits signed integer
uint32      32-bits unsigned integer
int64       64-bits signed integer
uint64      64-bits unsigned integer
intv        variable length signed integer, leading byte indicates the size of additional bytes that represents the integer
uintv       variable length unsigned integer

double64    double precesion float point value




beson    ::= uint8 uint8 content
content  ::=   "\x00" "\x00"                  null
             | "\x01" "\x00"                  false
             | "\x01" "\x01"                  true
             | "\x02" "\x00" int32            32-bits integer
             | "\x02" "\x01" int64            64-bits integer
             | "\x02" "\x02" int128           128-bits integer
             | "\x02" "\x03" int var          n-bits integer
             | "\x03" "\x01" uint64           64-bits unsigned integer
             | "\x03" "\x02" uint128          128-bits unsigned integer
             | "\x03" "\x03" uint var         n-bits unsigned integer
             | "\x04" "\x00" double64         64-bits floating point value
             | "\x05" "\x00" string           utf8 string ( contains bad character )
             | "\x06" "\x00" uint32 array     Determinative array with fixed items
             | "\x07" "\x00" array            Non-determinative array init operator
             | "\x08" "\x00"                  Non-determinative array end operator
             | "\x09" "\x00" uint32 object    Determinative object with fixed fields
             | "\x0A" "\x00" object           Non-determinative object init operator
             | "\x0B" "\x00"                  Non-determinative object end operator
             | "\x0C" "\x00" double64         JS Date ( Unix timestamp in milliseconds )
             | "\x0D" "\x00" (byte*12)        ObjectId
             | "\x0E" "\x00" uint32 (byte*)   Binary Data
             | "\x0F" "\x00" uint32 (byte*)   ArrayBuffer Data
             | "\x0F" "\x01" uint32 (byte*)   DataView Object
             | "\x0F" "\x02" uint32 (byte*)   Uint8Array Object
             | "\x0F" "\x03" uint32 (byte*)   Int8Array Object
             | "\x0F" "\x04" uint32 (byte*)   Uint16Array Object
             | "\x0F" "\x05" uint32 (byte*)   Int16Array Object
             | "\x0F" "\x06" uint32 (byte*)   Uint32Array Object
             | "\x0F" "\x07" uint32 (byte*)   Int32Array Object
             | "\x0F" "\x08" uint32 (byte*)   Float32Array Object
             | "\x0F" "\x09" uint32 (byte*)   Float64Array Object
             | "\x0F" "\x0A" ~ "\x1F" "\x00"  Reserved types
             
object  ::=    list_elm e_list 
             | list_elm ""
      
byte        ::= uint8
int32       ::= e_length (byte*4) binary
int64       ::= e_length (byte*8) binary
int128      ::= e_length (byte*12) binary
int var     ::= e_length (byte*16) binary
string      ::= uint32 (byte*)                UTF-8 string ends with 0x00 character
binary      ::= intv (byte*)

doc      ::= "\xFF" "\xFF" "\xFF" "\xFF" primitives "\x00" | document 
document ::= int32 e_list "\x00"	             BSON Document

             
e_list   ::= list_elm e_list | ""
list_elm ::=   "\x01" e_name double            64-bit binary floating point
             | "\x03" e_name document          Embedded document
             | "\x04" e_name document          Array
             | "\x05" e_name binary            Binary data
             | "\x07" e_name (byte*12)	     ObjectId
             | "\x08" e_name "\x00"            Boolean "false"
             | "\x08" e_name "\x01"            Boolean "true"
             | "\x09" e_name int64             UTC datetime
             | "\x0A" e_name                   Null value
             | "\x10" e_name int32            32-bit integer
             | "\x11" e_name uint64           Timestamp
             | "\x12" e_name int64            64-bit integer
             | "\x13" e_name decimal128       128-bit decimal floating point
       
             
e_name   ::= s_string                         Key name
string   ::= uint32 (byte*)                   String
s_string ::= uint16 (byte*)                   Short string
binary   ::= int32 subtype (byte*)            Binary
```
