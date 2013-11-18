//execute arbitrary js code in a relatively safe environment
bot.eval = (function () {
window.URL = window.URL || window.webkitURL || window.mozURL || null;

//translation tool: https://tinker.io/b2ff5
var worker_code = atob( 'dmFyIGdsb2JhbCA9IHRoaXM7DQoNCi8qbW9zdCBleHRyYSBmdW5jdGlvbnMgY291bGQgYmUgcG9zc2libHkgdW5zYWZlKi8NCnZhciB3aGl0ZXkgPSB7DQoJJ0FycmF5JyAgICAgICAgICAgICAgOiAxLA0KCSdCb29sZWFuJyAgICAgICAgICAgIDogMSwNCgknRGF0ZScgICAgICAgICAgICAgICA6IDEsDQoJJ0Vycm9yJyAgICAgICAgICAgICAgOiAxLA0KCSdFdmFsRXJyb3InICAgICAgICAgIDogMSwNCgknRnVuY3Rpb24nICAgICAgICAgICA6IDEsDQoJJ0luZmluaXR5JyAgICAgICAgICAgOiAxLA0KCSdKU09OJyAgICAgICAgICAgICAgIDogMSwNCgknTWF0aCcgICAgICAgICAgICAgICA6IDEsDQoJJ05hTicgICAgICAgICAgICAgICAgOiAxLA0KCSdOdW1iZXInICAgICAgICAgICAgIDogMSwNCgknT2JqZWN0JyAgICAgICAgICAgICA6IDEsDQoJJ1JhbmdlRXJyb3InICAgICAgICAgOiAxLA0KCSdSZWZlcmVuY2VFcnJvcicgICAgIDogMSwNCgknUmVnRXhwJyAgICAgICAgICAgICA6IDEsDQoJJ1N0cmluZycgICAgICAgICAgICAgOiAxLA0KCSdTeW50YXhFcnJvcicgICAgICAgIDogMSwNCgknVHlwZUVycm9yJyAgICAgICAgICA6IDEsDQoJJ1VSSUVycm9yJyAgICAgICAgICAgOiAxLA0KCSdhdG9iJyAgICAgICAgICAgICAgIDogMSwNCgknYnRvYScgICAgICAgICAgICAgICA6IDEsDQoJJ2RlY29kZVVSSScgICAgICAgICAgOiAxLA0KCSdkZWNvZGVVUklDb21wb25lbnQnIDogMSwNCgknZW5jb2RlVVJJJyAgICAgICAgICA6IDEsDQoJJ2VuY29kZVVSSUNvbXBvbmVudCcgOiAxLA0KCSdldmFsJyAgICAgICAgICAgICAgIDogMSwNCgknZ2xvYmFsJyAgICAgICAgICAgICA6IDEsDQoJJ2lzRmluaXRlJyAgICAgICAgICAgOiAxLA0KCSdpc05hTicgICAgICAgICAgICAgIDogMSwNCgknb25tZXNzYWdlJyAgICAgICAgICA6IDEsDQoJJ3BhcnNlRmxvYXQnICAgICAgICAgOiAxLA0KCSdwYXJzZUludCcgICAgICAgICAgIDogMSwNCgkncG9zdE1lc3NhZ2UnICAgICAgICA6IDEsDQoJJ3NlbGYnICAgICAgICAgICAgICAgOiAxLA0KCSd1bmRlZmluZWQnICAgICAgICAgIDogMSwNCgknd2hpdGV5JyAgICAgICAgICAgICA6IDEsDQoNCgkvKiB0eXBlZCBhcnJheXMgYW5kIHNoaXQgKi8NCgknQXJyYXlCdWZmZXInICAgICAgIDogMSwNCgknQmxvYicgICAgICAgICAgICAgIDogMSwNCgknRmxvYXQzMkFycmF5JyAgICAgIDogMSwNCgknRmxvYXQ2NEFycmF5JyAgICAgIDogMSwNCgknSW50OEFycmF5JyAgICAgICAgIDogMSwNCgknSW50MTZBcnJheScgICAgICAgIDogMSwNCgknSW50MzJBcnJheScgICAgICAgIDogMSwNCgknVWludDhBcnJheScgICAgICAgIDogMSwNCgknVWludDE2QXJyYXknICAgICAgIDogMSwNCgknVWludDMyQXJyYXknICAgICAgIDogMSwNCgknVWludDhDbGFtcGVkQXJyYXknIDogMSwNCg0KCS8qDQoJdGhlc2UgcHJvcGVydGllcyBhbGxvdyBGRiB0byBmdW5jdGlvbi4gd2l0aG91dCB0aGVtLCBhIGZ1Y2tmZXN0IG9mDQoJaW5leHBsaWNhYmxlIGVycm9ycyBlbnVzZXMuIHRvb2sgbWUgYWJvdXQgNCBob3VycyB0byB0cmFjayB0aGVzZSBmdWNrZXJzDQoJZG93bi4NCglmdWNrIGhlbGwgaXQgaXNuJ3QgZnV0dXJlLXByb29mLCBidXQgdGhlIGVycm9ycyB0aHJvd24gYXJlIHVuY2F0Y2hhYmxlDQoJYW5kIHVudHJhY2FibGUuIHNvIGEgaGVhZHMtdXAuIGVuam95LCBmdXR1cmUtbWUhDQoJKi8NCgknRE9NRXhjZXB0aW9uJyAgICAgIDogMSwNCgknRXZlbnQnICAgICAgICAgICAgIDogMSwNCgknTWVzc2FnZUV2ZW50JyAgICAgIDogMSwNCg0KCS8qRmlyZWZveCA+IDI1IHBhdGNoKi8NCgknV29ya2VyTWVzc2FnZUV2ZW50JzogMQ0KfTsNCg0KWyBnbG9iYWwsIGdsb2JhbC5fX3Byb3RvX18gXS5mb3JFYWNoKGZ1bmN0aW9uICggb2JqICkgew0KCU9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKCBvYmogKS5mb3JFYWNoKGZ1bmN0aW9uKCBwcm9wICkgew0KCQlpZiggIXdoaXRleS5oYXNPd25Qcm9wZXJ0eSggcHJvcCApICkgew0KCQkJZGVsZXRlIG9ialsgcHJvcCBdOw0KCQl9DQoJfSk7DQp9KTsNCg0KT2JqZWN0LmRlZmluZVByb3BlcnR5KCBBcnJheS5wcm90b3R5cGUsICdqb2luJywgew0KCXdyaXRhYmxlOiBmYWxzZSwNCgljb25maWd1cmFibGU6IGZhbHNlLA0KCWVudW1yYWJsZTogZmFsc2UsDQoNCgl2YWx1ZTogKGZ1bmN0aW9uICggb2xkICkgew0KCQlyZXR1cm4gZnVuY3Rpb24gKCBhcmcgKSB7DQoJCQlpZiAoIHRoaXMubGVuZ3RoID4gNTAwIHx8IChhcmcgJiYgYXJnLmxlbmd0aCA+IDUwMCkgKSB7DQoJCQkJdGhyb3cgJ0V4Y2VwdGlvbjogdG9vIG1hbnkgaXRlbXMnOw0KCQkJfQ0KDQoJCQlyZXR1cm4gb2xkLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTsNCgkJfTsNCgl9KCBBcnJheS5wcm90b3R5cGUuam9pbiApKQ0KfSk7DQoNCi8qIHdlIGRlZmluZSBpdCBvdXRzaWRlIHNvIGl0J2xsIG5vdCBiZSBpbiBzdHJpY3QgbW9kZSAqLw0KZnVuY3Rpb24gZXhlYyAoIGNvZGUgKSB7DQoJcmV0dXJuIGV2YWwoICd1bmRlZmluZWQ7XG4nICsgY29kZSApOw0KfQ0KdmFyIGNvbnNvbGUgPSB7DQoJX2l0ZW1zIDogW10sDQoJbG9nIDogZnVuY3Rpb24oKSB7DQoJCWNvbnNvbGUuX2l0ZW1zLnB1c2guYXBwbHkoIGNvbnNvbGUuX2l0ZW1zLCBhcmd1bWVudHMgKTsNCgl9DQp9Ow0KY29uc29sZS5lcnJvciA9IGNvbnNvbGUuaW5mbyA9IGNvbnNvbGUuZGVidWcgPSBjb25zb2xlLmxvZzsNCnZhciBwID0gY29uc29sZS5sb2cuYmluZCggY29uc29sZSApOw0KDQoJZ2xvYmFsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICggZXZlbnQgKSB7DQoJCXBvc3RNZXNzYWdlKHsNCgkJCWV2ZW50IDogJ3N0YXJ0Jw0KCQl9KTsNCg0KCQl2YXIganNvblN0cmluZ2lmeSA9IEpTT04uc3RyaW5naWZ5LCAvKmJhY2t1cCovDQoJCQlyZXN1bHQ7DQoNCgkJdHJ5IHsNCgkJCXJlc3VsdCA9IGV4ZWMoIGV2ZW50LmRhdGEgKTsNCgkJfQ0KCQljYXRjaCAoIGUgKSB7DQoJCQlyZXN1bHQgPSBlLnRvU3RyaW5nKCk7DQoJCX0NCg0KCQkvKkpTT04gZG9lcyBub3QgbGlrZSBhbnkgb2YgdGhlIGZvbGxvd2luZyovDQoJCXZhciBzdHJ1bmcgPSB7DQoJCQlGdW5jdGlvbiAgOiB0cnVlLCBFcnJvciAgOiB0cnVlLA0KCQkJVW5kZWZpbmVkIDogdHJ1ZSwgUmVnRXhwIDogdHJ1ZQ0KCQl9Ow0KCQl2YXIgc2hvdWxkX3N0cmluZyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7DQoJCQl2YXIgdHlwZSA9ICgge30gKS50b1N0cmluZy5jYWxsKCB2YWx1ZSApLnNsaWNlKCA4LCAtMSApOw0KDQoJCQlpZiAoIHR5cGUgaW4gc3RydW5nICkgew0KCQkJCXJldHVybiB0cnVlOw0KCQkJfQ0KCQkJLypuZWl0aGVyIGRvZXMgaXQgZmVlbCBjb21wYXNzaW9uYXRlIGFib3V0IE5hTiBvciBJbmZpbml0eSovDQoJCQlyZXR1cm4gdmFsdWUgIT09IHZhbHVlIHx8IHZhbHVlID09PSBJbmZpbml0eTsNCgkJfTsNCg0KCQl2YXIgcmV2aXZlciA9IGZ1bmN0aW9uICgga2V5LCB2YWx1ZSApIHsNCgkJCXZhciBvdXRwdXQ7DQoNCgkJCWlmICggc2hvdWxkX3N0cmluZyh2YWx1ZSkgKSB7DQoJCQkJb3V0cHV0ID0gJycgKyB2YWx1ZTsNCgkJCX0NCgkJCWVsc2Ugew0KCQkJCW91dHB1dCA9IHZhbHVlOw0KCQkJfQ0KDQoJCQlyZXR1cm4gb3V0cHV0Ow0KCQl9Ow0KDQoJCXBvc3RNZXNzYWdlKHsNCgkJCWFuc3dlciA6IGpzb25TdHJpbmdpZnkoIHJlc3VsdCwgcmV2aXZlciApLA0KCQkJbG9nICAgIDoganNvblN0cmluZ2lmeSggY29uc29sZS5faXRlbXMsIHJldml2ZXIgKS5zbGljZSggMSwgLTEgKQ0KCQl9KTsNCgl9Ow0K' );
var blob = new Blob( [worker_code], { type : 'application/javascript' } ),
	code_url = window.URL.createObjectURL( blob );

setTimeout(function () {
    if (bot.devMode) {
        return;
    }
    IO.injectScript( 'https://raw.github.com/jashkenas/coffee-script/master/extras/coffee-script.js' );
}, 1000);

return function ( msg, cb ) {
	var worker = new Worker( code_url ),
		timeout;

	var code = msg.toString();

	if ( code[0] === 'c' ) {
		code = CoffeeScript.compile( code.replace(/^c>/, ''), {bare:1} );
	}
	else {
		code = code.replace( /^>/, '' );
	}

	worker.onmessage = function ( evt ) {
		var type = evt.data.event;
		if ( type === 'start' ) {
			start();
		}
		else {
			finish( dressUpAnswer(evt.data) );
		}
	};

	worker.onerror = function ( error ) {
        bot.log( error, 'eval worker.onerror' );
		finish( error.toString() );
	};

	//and it all boils down to this...
	worker.postMessage( code );

	function start () {
		if ( timeout ) {
			return;
		}

		timeout = window.setTimeout(function() {
			finish( 'Maximum execution time exceeded' );
		}, 500 );
	}

	function finish ( result ) {
		clearTimeout( timeout );
		worker.terminate();

		if ( cb && cb.call ) {
			cb( result );
		}
		else {
			msg.directreply( result );
		}
	}
};

function dressUpAnswer ( answerObj ) {
	bot.log( answerObj, 'eval answerObj' );
	var answer = answerObj.answer,
		log = answerObj.log,
		result;

	if ( answer === undefined ) {
		return 'Malformed output from web-worker. If you weren\'t just ' +
			'fooling around trying to break me, raise an issue or contact ' +
			'Zirak';
	}

	result = snipAndCodify( answer );

	if ( log && log.length ) {
		result += ' Logged: ' + snipAndCodify( log );
	}

	return result;
}
function snipAndCodify ( str ) {
	var ret;

	if ( str.length > 400 ) {
		ret = '`' +  str.slice(0, 400) + '` (snip)';
	}
	else {
		ret = '`' + str +'`';
	}

	return ret;
}
}());
