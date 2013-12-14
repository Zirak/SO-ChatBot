//execute arbitrary js code in a relatively safe environment
bot.eval = (function () {
window.URL = window.URL || window.webkitURL || window.mozURL || null;

//translation tool: http://tinkerbin.heroku.com/84dPpGFr
var worker_code = atob( 'dmFyIGdsb2JhbCA9IHRoaXM7CgovKm1vc3QgZXh0cmEgZnVuY3Rpb25zIGNvdWxkIGJlIHBvc3NpYmx5IHVuc2FmZSovCnZhciB3aGl0ZXkgPSB7CgknQXJyYXknICAgICAgICAgICAgICA6IDEsCgknQm9vbGVhbicgICAgICAgICAgICA6IDEsCgknY29uc29sZScgICAgICAgICAgICA6IDEsCgknRGF0ZScgICAgICAgICAgICAgICA6IDEsCgknRXJyb3InICAgICAgICAgICAgICA6IDEsCgknRXZhbEVycm9yJyAgICAgICAgICA6IDEsCgknZXhlYycgICAgICAgICAgICAgICA6IDEsCgknRnVuY3Rpb24nICAgICAgICAgICA6IDEsCgknSW5maW5pdHknICAgICAgICAgICA6IDEsCgknSlNPTicgICAgICAgICAgICAgICA6IDEsCgknTWF0aCcgICAgICAgICAgICAgICA6IDEsCgknTmFOJyAgICAgICAgICAgICAgICA6IDEsCgknTnVtYmVyJyAgICAgICAgICAgICA6IDEsCgknT2JqZWN0JyAgICAgICAgICAgICA6IDEsCgknUmFuZ2VFcnJvcicgICAgICAgICA6IDEsCgknUmVmZXJlbmNlRXJyb3InICAgICA6IDEsCgknUmVnRXhwJyAgICAgICAgICAgICA6IDEsCgknU3RyaW5nJyAgICAgICAgICAgICA6IDEsCgknU3ludGF4RXJyb3InICAgICAgICA6IDEsCgknVHlwZUVycm9yJyAgICAgICAgICA6IDEsCgknVVJJRXJyb3InICAgICAgICAgICA6IDEsCgknYXRvYicgICAgICAgICAgICAgICA6IDEsCgknYnRvYScgICAgICAgICAgICAgICA6IDEsCgknZGVjb2RlVVJJJyAgICAgICAgICA6IDEsCgknZGVjb2RlVVJJQ29tcG9uZW50JyA6IDEsCgknZW5jb2RlVVJJJyAgICAgICAgICA6IDEsCgknZW5jb2RlVVJJQ29tcG9uZW50JyA6IDEsCgknZXZhbCcgICAgICAgICAgICAgICA6IDEsCgknZ2xvYmFsJyAgICAgICAgICAgICA6IDEsCgknaXNGaW5pdGUnICAgICAgICAgICA6IDEsCgknaXNOYU4nICAgICAgICAgICAgICA6IDEsCgknb25tZXNzYWdlJyAgICAgICAgICA6IDEsCgkncGFyc2VGbG9hdCcgICAgICAgICA6IDEsCgkncGFyc2VJbnQnICAgICAgICAgICA6IDEsCgkncG9zdE1lc3NhZ2UnICAgICAgICA6IDEsCgknc2VsZicgICAgICAgICAgICAgICA6IDEsCgkndW5kZWZpbmVkJyAgICAgICAgICA6IDEsCgknd2hpdGV5JyAgICAgICAgICAgICA6IDEsCgoJLyogdHlwZWQgYXJyYXlzIGFuZCBzaGl0ICovCgknQXJyYXlCdWZmZXInICAgICAgIDogMSwKCSdCbG9iJyAgICAgICAgICAgICAgOiAxLAoJJ0Zsb2F0MzJBcnJheScgICAgICA6IDEsCgknRmxvYXQ2NEFycmF5JyAgICAgIDogMSwKCSdJbnQ4QXJyYXknICAgICAgICAgOiAxLAoJJ0ludDE2QXJyYXknICAgICAgICA6IDEsCgknSW50MzJBcnJheScgICAgICAgIDogMSwKCSdVaW50OEFycmF5JyAgICAgICAgOiAxLAoJJ1VpbnQxNkFycmF5JyAgICAgICA6IDEsCgknVWludDMyQXJyYXknICAgICAgIDogMSwKCSdVaW50OENsYW1wZWRBcnJheScgOiAxLAoKCS8qCgl0aGVzZSBwcm9wZXJ0aWVzIGFsbG93IEZGIHRvIGZ1bmN0aW9uLiB3aXRob3V0IHRoZW0sIGEgZnVja2Zlc3Qgb2YKCWluZXhwbGljYWJsZSBlcnJvcnMgZW51c2VzLiB0b29rIG1lIGFib3V0IDQgaG91cnMgdG8gdHJhY2sgdGhlc2UgZnVja2VycwoJZG93bi4KCWZ1Y2sgaGVsbCBpdCBpc24ndCBmdXR1cmUtcHJvb2YsIGJ1dCB0aGUgZXJyb3JzIHRocm93biBhcmUgdW5jYXRjaGFibGUKCWFuZCB1bnRyYWNhYmxlLiBzbyBhIGhlYWRzLXVwLiBlbmpveSwgZnV0dXJlLW1lIQoJKi8KCSdET01FeGNlcHRpb24nIDogMSwKCSdFdmVudCcgICAgICAgIDogMSwKCSdNZXNzYWdlRXZlbnQnIDogMSwKCSdXb3JrZXJNZXNzYWdlRXZlbnQnOiAxCn07CgpbIGdsb2JhbCwgT2JqZWN0LmdldFByb3RvdHlwZU9mKGdsb2JhbCkgXS5mb3JFYWNoKGZ1bmN0aW9uICggb2JqICkgewoJT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoIG9iaiApLmZvckVhY2goZnVuY3Rpb24oIHByb3AgKSB7CgkJaWYoIHdoaXRleS5oYXNPd25Qcm9wZXJ0eShwcm9wKSApIHsKICAgICAgICAgICAgcmV0dXJuOwoJCX0KCiAgICAgICAgdHJ5IHsKICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBvYmosIHByb3AsIHsKICAgICAgICAgICAgICAgIGdldCA6IGZ1bmN0aW9uICgpIHsKICAgICAgICAgICAgICAgICAgICAvKiBURUUgSEVFICovCiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCBwcm9wICsgJyBpcyBub3QgZGVmaW5lZCcgKTsKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICBjb25maWd1cmFibGUgOiBmYWxzZSwKICAgICAgICAgICAgICAgIGVudW1lcmFibGUgOiBmYWxzZQogICAgICAgICAgICB9KTsKICAgICAgICB9CiAgICAgICAgY2F0Y2ggKCBlICkgewogICAgICAgICAgICBkZWxldGUgb2JqWyBwcm9wIF07CgogICAgICAgICAgICBpZiAoIG9ialsgcHJvcCBdICE9PSB1bmRlZmluZWQgKSB7CiAgICAgICAgICAgICAgICBvYmpbIHByb3AgXSA9IG51bGw7CiAgICAgICAgICAgIH0KICAgICAgICB9Cgl9KTsKfSk7CgpPYmplY3QuZGVmaW5lUHJvcGVydHkoIEFycmF5LnByb3RvdHlwZSwgJ2pvaW4nLCB7Cgl3cml0YWJsZTogZmFsc2UsCgljb25maWd1cmFibGU6IGZhbHNlLAoJZW51bXJhYmxlOiBmYWxzZSwKCgl2YWx1ZTogKGZ1bmN0aW9uICggb2xkICkgewoJCXJldHVybiBmdW5jdGlvbiAoIGFyZyApIHsKCQkJaWYgKCB0aGlzLmxlbmd0aCA+IDUwMCB8fCAoYXJnICYmIGFyZy5sZW5ndGggPiA1MDApICkgewoJCQkJdGhyb3cgJ0V4Y2VwdGlvbjogdG9vIG1hbnkgaXRlbXMnOwoJCQl9CgoJCQlyZXR1cm4gb2xkLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTsKCQl9OwoJfSggQXJyYXkucHJvdG90eXBlLmpvaW4gKSkKfSk7CgovKiB3ZSBkZWZpbmUgaXQgb3V0c2lkZSBzbyBpdCdsbCBub3QgYmUgaW4gc3RyaWN0IG1vZGUgKi8KdmFyIGV4ZWMgPSBmdW5jdGlvbiAoIGNvZGUgKSB7CglyZXR1cm4gZXZhbCggJ3VuZGVmaW5lZDtcbicgKyBjb2RlICk7Cn0KdmFyIGNvbnNvbGUgPSB7CglfaXRlbXMgOiBbXSwKCWxvZyA6IGZ1bmN0aW9uKCkgewoJCWNvbnNvbGUuX2l0ZW1zLnB1c2guYXBwbHkoIGNvbnNvbGUuX2l0ZW1zLCBhcmd1bWVudHMgKTsKCX0KfTsKY29uc29sZS5lcnJvciA9IGNvbnNvbGUuaW5mbyA9IGNvbnNvbGUuZGVidWcgPSBjb25zb2xlLmxvZzsKCihmdW5jdGlvbigpewoJInVzZSBzdHJpY3QiOwoKCWdsb2JhbC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoIGV2ZW50ICkgewoJCXBvc3RNZXNzYWdlKHsKCQkJZXZlbnQgOiAnc3RhcnQnCgkJfSk7CgoJCXZhciBqc29uU3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnksIC8qYmFja3VwKi8KCQkJcmVzdWx0OwoKCQl0cnkgewoJCQlyZXN1bHQgPSBleGVjKCBldmVudC5kYXRhICk7CgkJfQoJCWNhdGNoICggZSApIHsKCQkJcmVzdWx0ID0gZS50b1N0cmluZygpOwoJCX0KCgkJLypKU09OIGRvZXMgbm90IGxpa2UgYW55IG9mIHRoZSBmb2xsb3dpbmcqLwoJCXZhciBzdHJ1bmcgPSB7CgkJCUZ1bmN0aW9uICA6IHRydWUsIEVycm9yICA6IHRydWUsCgkJCVVuZGVmaW5lZCA6IHRydWUsIFJlZ0V4cCA6IHRydWUKCQl9OwoJCXZhciBzaG91bGRfc3RyaW5nID0gZnVuY3Rpb24gKCB2YWx1ZSApIHsKCQkJdmFyIHR5cGUgPSAoIHt9ICkudG9TdHJpbmcuY2FsbCggdmFsdWUgKS5zbGljZSggOCwgLTEgKTsKCgkJCWlmICggdHlwZSBpbiBzdHJ1bmcgKSB7CgkJCQlyZXR1cm4gdHJ1ZTsKCQkJfQoJCQkvKm5laXRoZXIgZG9lcyBpdCBmZWVsIGNvbXBhc3Npb25hdGUgYWJvdXQgTmFOIG9yIEluZmluaXR5Ki8KCQkJcmV0dXJuIHZhbHVlICE9PSB2YWx1ZSB8fCB2YWx1ZSA9PT0gSW5maW5pdHk7CgkJfTsKCgkJdmFyIHJldml2ZXIgPSBmdW5jdGlvbiAoIGtleSwgdmFsdWUgKSB7CgkJCXZhciBvdXRwdXQ7CgoJCQlpZiAoIHNob3VsZF9zdHJpbmcodmFsdWUpICkgewoJCQkJb3V0cHV0ID0gJycgKyB2YWx1ZTsKCQkJfQoJCQllbHNlIHsKCQkJCW91dHB1dCA9IHZhbHVlOwoJCQl9CgoJCQlyZXR1cm4gb3V0cHV0OwoJCX07CgoJCXBvc3RNZXNzYWdlKHsKCQkJYW5zd2VyIDoganNvblN0cmluZ2lmeSggcmVzdWx0LCByZXZpdmVyICksCgkJCWxvZyAgICA6IGpzb25TdHJpbmdpZnkoIGNvbnNvbGUuX2l0ZW1zLCByZXZpdmVyICkuc2xpY2UoIDEsIC0xICkKCQl9KTsKCX07Cn0pKCk7Cg==' );
var blob = new Blob( [worker_code], { type : 'application/javascript' } ),
	code_url = window.URL.createObjectURL( blob );

setTimeout(function () {
    if (bot.devMode) {
        return;
    }
    IO.injectScript( 'https://raw.github.com/jashkenas/coffee-script/master/extras/coffee-script.js' );
}, 1000);

return function ( code, cb ) {
	var worker = new Worker( code_url ),
		timeout;

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
	//so fucking cool.

	function start () {
		if ( timeout ) {
			return;
		}

		timeout = window.setTimeout(function () {
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
			console.warn( 'eval did not get callback' );
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
