var global = this;

/* Could possibly create some helper functions here so they are always available when executing code in chat?*/

/* Most extra functions could be possibly unsafe */

["XMLHttpRequest",
 "importScripts",
 "Worker",
 "FileReaderSync",
 "setTimeout",
 "clearTimeout",
 "dump",
 "clearInterval",
 "setInterval"].forEach( function( possiblyUnsafe){
	 Object.defineProperty( global, possiblyUnsafe, {
		 get : function() {
			 throw new Error(
				 "Security Exception: cannot access " + possiblyUnsafe
			 );
			 return 1;
		 },
		 configurable : false
	 });
 });

/* Esailija is geat in bed */

onmessage = function( event ) {
	"use strict";
	var code = event.data.code;
	var result;
	try {
		result = eval( '"use strict";\n' + code );
	}
	catch(e){
		result = e.toString();
	}
	postMessage( "(" + typeof result + ")" + " " + result );
};
