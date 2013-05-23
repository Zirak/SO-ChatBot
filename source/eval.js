//execute arbitrary js code in a relatively safe environment
bot.eval = (function () {
window.URL = window.URL || window.webkitURL || window.mozURL || null;

//translation tool: https://tinker.io/b2ff5
var worker_code = atob( 'dmFyIGdsb2JhbCA9IHRoaXM7CgovKm1vc3QgZXh0cmEgZnVuY3Rpb25zIGNvdWxkIGJlIHBvc3NpYmx5IHVuc2FmZSovCnZhciB3aGl0ZXkgPSB7CgknQXJyYXknICAgICAgICAgICAgICA6IDEsCgknQm9vbGVhbicgICAgICAgICAgICA6IDEsCgknRGF0ZScgICAgICAgICAgICAgICA6IDEsCgknRXJyb3InICAgICAgICAgICAgICA6IDEsCgknRXZhbEVycm9yJyAgICAgICAgICA6IDEsCgknRnVuY3Rpb24nICAgICAgICAgICA6IDEsCgknSW5maW5pdHknICAgICAgICAgICA6IDEsCgknSlNPTicgICAgICAgICAgICAgICA6IDEsCgknTWF0aCcgICAgICAgICAgICAgICA6IDEsCgknTmFOJyAgICAgICAgICAgICAgICA6IDEsCgknTnVtYmVyJyAgICAgICAgICAgICA6IDEsCgknT2JqZWN0JyAgICAgICAgICAgICA6IDEsCgknUmFuZ2VFcnJvcicgICAgICAgICA6IDEsCgknUmVmZXJlbmNlRXJyb3InICAgICA6IDEsCgknUmVnRXhwJyAgICAgICAgICAgICA6IDEsCgknU3RyaW5nJyAgICAgICAgICAgICA6IDEsCgknU3ludGF4RXJyb3InICAgICAgICA6IDEsCgknVHlwZUVycm9yJyAgICAgICAgICA6IDEsCgknVVJJRXJyb3InICAgICAgICAgICA6IDEsCgknYXRvYicgICAgICAgICAgICAgICA6IDEsCgknYnRvYScgICAgICAgICAgICAgICA6IDEsCgknZGVjb2RlVVJJJyAgICAgICAgICA6IDEsCgknZGVjb2RlVVJJQ29tcG9uZW50JyA6IDEsCgknZW5jb2RlVVJJJyAgICAgICAgICA6IDEsCgknZW5jb2RlVVJJQ29tcG9uZW50JyA6IDEsCgknZXZhbCcgICAgICAgICAgICAgICA6IDEsCgknZ2xvYmFsJyAgICAgICAgICAgICA6IDEsCgknaXNGaW5pdGUnICAgICAgICAgICA6IDEsCgknaXNOYU4nICAgICAgICAgICAgICA6IDEsCgknb25tZXNzYWdlJyAgICAgICAgICA6IDEsCgkncGFyc2VGbG9hdCcgICAgICAgICA6IDEsCgkncGFyc2VJbnQnICAgICAgICAgICA6IDEsCgkncG9zdE1lc3NhZ2UnICAgICAgICA6IDEsCgknc2VsZicgICAgICAgICAgICAgICA6IDEsCgkndW5kZWZpbmVkJyAgICAgICAgICA6IDEsCgknd2hpdGV5JyAgICAgICAgICAgICA6IDEsCgoJLyogdHlwZWQgYXJyYXlzIGFuZCBzaGl0ICovCgknQXJyYXlCdWZmZXInICAgICAgIDogMSwKCSdCbG9iJyAgICAgICAgICAgICAgOiAxLAoJJ0Zsb2F0MzJBcnJheScgICAgICA6IDEsCgknRmxvYXQ2NEFycmF5JyAgICAgIDogMSwKCSdJbnQ4QXJyYXknICAgICAgICAgOiAxLAoJJ0ludDE2QXJyYXknICAgICAgICA6IDEsCgknSW50MzJBcnJheScgICAgICAgIDogMSwKCSdVaW50OEFycmF5JyAgICAgICAgOiAxLAoJJ1VpbnQxNkFycmF5JyAgICAgICA6IDEsCgknVWludDMyQXJyYXknICAgICAgIDogMSwKCSdVaW50OENsYW1wZWRBcnJheScgOiAxLAoKCS8qCgl0aGVzZSBwcm9wZXJ0aWVzIGFsbG93IEZGIHRvIGZ1bmN0aW9uLiB3aXRob3V0IHRoZW0sIGEgZnVja2Zlc3Qgb2YKCWluZXhwbGljYWJsZSBlcnJvcnMgZW51c2VzLiB0b29rIG1lIGFib3V0IDQgaG91cnMgdG8gdHJhY2sgdGhlc2UgZnVja2VycwoJZG93bi4KCWZ1Y2sgaGVsbCBpdCBpc24ndCBmdXR1cmUtcHJvb2YsIGJ1dCB0aGUgZXJyb3JzIHRocm93biBhcmUgdW5jYXRjaGFibGUKCWFuZCB1bnRyYWNhYmxlLiBzbyBhIGhlYWRzLXVwLiBlbmpveSwgZnV0dXJlLW1lIQoJKi8KCSdET01FeGNlcHRpb24nIDogMSwKCSdFdmVudCcgICAgICAgIDogMSwKCSdNZXNzYWdlRXZlbnQnIDogMQp9OwoKWyBnbG9iYWwsIGdsb2JhbC5fX3Byb3RvX18gXS5mb3JFYWNoKGZ1bmN0aW9uICggb2JqICkgewoJT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoIG9iaiApLmZvckVhY2goZnVuY3Rpb24oIHByb3AgKSB7CgkJaWYoICF3aGl0ZXkuaGFzT3duUHJvcGVydHkoIHByb3AgKSApIHsKCQkJZGVsZXRlIG9ialsgcHJvcCBdOwoJCX0KCX0pOwp9KTsKCk9iamVjdC5kZWZpbmVQcm9wZXJ0eSggQXJyYXkucHJvdG90eXBlLCAnam9pbicsIHsKCXdyaXRhYmxlOiBmYWxzZSwKCWNvbmZpZ3VyYWJsZTogZmFsc2UsCgllbnVtcmFibGU6IGZhbHNlLAoKCXZhbHVlOiAoZnVuY3Rpb24gKCBvbGQgKSB7CgkJcmV0dXJuIGZ1bmN0aW9uICggYXJnICkgewoJCQlpZiAoIHRoaXMubGVuZ3RoID4gNTAwIHx8IChhcmcgJiYgYXJnLmxlbmd0aCA+IDUwMCkgKSB7CgkJCQl0aHJvdyAnRXhjZXB0aW9uOiB0b28gbWFueSBpdGVtcyc7CgkJCX0KCgkJCXJldHVybiBvbGQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApOwoJCX07Cgl9KCBBcnJheS5wcm90b3R5cGUuam9pbiApKQp9KTsKCi8qIHdlIGRlZmluZSBpdCBvdXRzaWRlIHNvIGl0J2xsIG5vdCBiZSBpbiBzdHJpY3QgbW9kZSAqLwpmdW5jdGlvbiBleGVjICggY29kZSApIHsKCXJldHVybiBldmFsKCAndW5kZWZpbmVkO1xuJyArIGNvZGUgKTsKfQp2YXIgY29uc29sZSA9IHsKCV9pdGVtcyA6IFtdLAoJbG9nIDogZnVuY3Rpb24oKSB7CgkJY29uc29sZS5faXRlbXMucHVzaC5hcHBseSggY29uc29sZS5faXRlbXMsIGFyZ3VtZW50cyApOwoJfQp9Owpjb25zb2xlLmVycm9yID0gY29uc29sZS5pbmZvID0gY29uc29sZS5kZWJ1ZyA9IGNvbnNvbGUubG9nOwp2YXIgcCA9IGNvbnNvbGUubG9nLmJpbmQoIGNvbnNvbGUgKTsKCihmdW5jdGlvbigpewoJInVzZSBzdHJpY3QiOwoKCWdsb2JhbC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoIGV2ZW50ICkgewoJCXBvc3RNZXNzYWdlKHsKCQkJZXZlbnQgOiAnc3RhcnQnCgkJfSk7CgoJCXZhciBqc29uU3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnksIC8qYmFja3VwKi8KCQkJcmVzdWx0OwoKCQl0cnkgewoJCQlyZXN1bHQgPSBleGVjKCBldmVudC5kYXRhICk7CgkJfQoJCWNhdGNoICggZSApIHsKCQkJcmVzdWx0ID0gZS50b1N0cmluZygpOwoJCX0KCgkJLypKU09OIGRvZXMgbm90IGxpa2UgYW55IG9mIHRoZSBmb2xsb3dpbmcqLwoJCXZhciBzdHJ1bmcgPSB7CgkJCUZ1bmN0aW9uICA6IHRydWUsIEVycm9yICA6IHRydWUsCgkJCVVuZGVmaW5lZCA6IHRydWUsIFJlZ0V4cCA6IHRydWUKCQl9OwoJCXZhciBzaG91bGRfc3RyaW5nID0gZnVuY3Rpb24gKCB2YWx1ZSApIHsKCQkJdmFyIHR5cGUgPSAoIHt9ICkudG9TdHJpbmcuY2FsbCggdmFsdWUgKS5zbGljZSggOCwgLTEgKTsKCgkJCWlmICggdHlwZSBpbiBzdHJ1bmcgKSB7CgkJCQlyZXR1cm4gdHJ1ZTsKCQkJfQoJCQkvKm5laXRoZXIgZG9lcyBpdCBmZWVsIGNvbXBhc3Npb25hdGUgYWJvdXQgTmFOIG9yIEluZmluaXR5Ki8KCQkJcmV0dXJuIHZhbHVlICE9PSB2YWx1ZSB8fCB2YWx1ZSA9PT0gSW5maW5pdHk7CgkJfTsKCgkJdmFyIHJldml2ZXIgPSBmdW5jdGlvbiAoIGtleSwgdmFsdWUgKSB7CgkJCXZhciBvdXRwdXQ7CgoJCQlpZiAoIHNob3VsZF9zdHJpbmcodmFsdWUpICkgewoJCQkJb3V0cHV0ID0gJycgKyB2YWx1ZTsKCQkJfQoJCQllbHNlIHsKCQkJCW91dHB1dCA9IHZhbHVlOwoJCQl9CgoJCQlyZXR1cm4gb3V0cHV0OwoJCX07CgoJCXBvc3RNZXNzYWdlKHsKCQkJYW5zd2VyIDoganNvblN0cmluZ2lmeSggcmVzdWx0LCByZXZpdmVyICksCgkJCWxvZyAgICA6IGpzb25TdHJpbmdpZnkoIGNvbnNvbGUuX2l0ZW1zLCByZXZpdmVyICkuc2xpY2UoIDEsIC0xICkKCQl9KTsKCX07Cn0pKCk7Cg==' );
var blob = new Blob( [worker_code], { type : 'application/javascript' } ),
	code_url = window.URL.createObjectURL( blob );

IO.injectScript( 'https://raw.github.com/jashkenas/coffee-script/master/extras/coffee-script.js' );

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
		finish( error.toString() );
	};

	//and it all boils down to this...
	worker.postMessage( code );

	function start () {
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
