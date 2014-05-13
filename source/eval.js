//execute arbitrary js code in a relatively safe environment
bot.eval = (function () {
window.URL = window.URL || window.webkitURL || window.mozURL || null;

//translation tool: http://tinkerbin.heroku.com/84dPpGFr
var worker_code = atob( 'dmFyIGdsb2JhbCA9IHRoaXM7CgovKm1vc3QgZXh0cmEgZnVuY3Rpb25zIGNvdWxkIGJlIHBvc3NpYmx5IHVuc2FmZSovCnZhciB3aGl0ZXkgPSB7CgknQXJyYXknICAgICAgICAgICAgICA6IDEsCgknQm9vbGVhbicgICAgICAgICAgICA6IDEsCgknRGF0ZScgICAgICAgICAgICAgICA6IDEsCgknRXJyb3InICAgICAgICAgICAgICA6IDEsCgknRXZhbEVycm9yJyAgICAgICAgICA6IDEsCgknRnVuY3Rpb24nICAgICAgICAgICA6IDEsCgknSW5maW5pdHknICAgICAgICAgICA6IDEsCgknSlNPTicgICAgICAgICAgICAgICA6IDEsCgknTWFwJyAgICAgICAgICAgICAgICA6IDEsCgknTWF0aCcgICAgICAgICAgICAgICA6IDEsCgknTmFOJyAgICAgICAgICAgICAgICA6IDEsCgknTnVtYmVyJyAgICAgICAgICAgICA6IDEsCgknT2JqZWN0JyAgICAgICAgICAgICA6IDEsCgknUHJvbWlzZScgICAgICAgICAgICA6IDEsCgknUHJveHknICAgICAgICAgICAgICA6IDEsCgknUmFuZ2VFcnJvcicgICAgICAgICA6IDEsCgknUmVmZXJlbmNlRXJyb3InICAgICA6IDEsCgknUmVnRXhwJyAgICAgICAgICAgICA6IDEsCgknU2V0JyAgICAgICAgICAgICAgICA6IDEsCgknU3RyaW5nJyAgICAgICAgICAgICA6IDEsCgknU3ludGF4RXJyb3InICAgICAgICA6IDEsCgknVHlwZUVycm9yJyAgICAgICAgICA6IDEsCgknVVJJRXJyb3InICAgICAgICAgICA6IDEsCgknV2Vha01hcCcgICAgICAgICAgICA6IDEsCgknV2Vha1NldCcgICAgICAgICAgICA6IDEsCgknYXRvYicgICAgICAgICAgICAgICA6IDEsCgknYnRvYScgICAgICAgICAgICAgICA6IDEsCgknY29uc29sZScgICAgICAgICAgICA6IDEsCgknZGVjb2RlVVJJJyAgICAgICAgICA6IDEsCgknZGVjb2RlVVJJQ29tcG9uZW50JyA6IDEsCgknZW5jb2RlVVJJJyAgICAgICAgICA6IDEsCgknZW5jb2RlVVJJQ29tcG9uZW50JyA6IDEsCgknZXZhbCcgICAgICAgICAgICAgICA6IDEsCgknZXhlYycgICAgICAgICAgICAgICA6IDEsIC8qIG91ciBvd24gZnVuY3Rpb24gKi8KCSdnbG9iYWwnICAgICAgICAgICAgIDogMSwKCSdpc0Zpbml0ZScgICAgICAgICAgIDogMSwKCSdpc05hTicgICAgICAgICAgICAgIDogMSwKCSdvbm1lc3NhZ2UnICAgICAgICAgIDogMSwKCSdwYXJzZUZsb2F0JyAgICAgICAgIDogMSwKCSdwYXJzZUludCcgICAgICAgICAgIDogMSwKCSdwb3N0TWVzc2FnZScgICAgICAgIDogMSwKCSdzZWxmJyAgICAgICAgICAgICAgIDogMSwKCSd1bmRlZmluZWQnICAgICAgICAgIDogMSwKCSd3aGl0ZXknICAgICAgICAgICAgIDogMSwKCgkvKiB0eXBlZCBhcnJheXMgYW5kIHNoaXQgKi8KCSdBcnJheUJ1ZmZlcicgICAgICAgOiAxLAoJJ0Jsb2InICAgICAgICAgICAgICA6IDEsCgknRmxvYXQzMkFycmF5JyAgICAgIDogMSwKCSdGbG9hdDY0QXJyYXknICAgICAgOiAxLAoJJ0ludDhBcnJheScgICAgICAgICA6IDEsCgknSW50MTZBcnJheScgICAgICAgIDogMSwKCSdJbnQzMkFycmF5JyAgICAgICAgOiAxLAoJJ1VpbnQ4QXJyYXknICAgICAgICA6IDEsCgknVWludDE2QXJyYXknICAgICAgIDogMSwKCSdVaW50MzJBcnJheScgICAgICAgOiAxLAoJJ1VpbnQ4Q2xhbXBlZEFycmF5JyA6IDEsCgoJLyoKCXRoZXNlIHByb3BlcnRpZXMgYWxsb3cgRkYgdG8gZnVuY3Rpb24uIHdpdGhvdXQgdGhlbSwgYSBmdWNrZmVzdCBvZgoJaW5leHBsaWNhYmxlIGVycm9ycyBlbnVzZXMuIHRvb2sgbWUgYWJvdXQgNCBob3VycyB0byB0cmFjayB0aGVzZSBmdWNrZXJzCglkb3duLgoJZnVjayBoZWxsIGl0IGlzbid0IGZ1dHVyZS1wcm9vZiwgYnV0IHRoZSBlcnJvcnMgdGhyb3duIGFyZSB1bmNhdGNoYWJsZQoJYW5kIHVudHJhY2FibGUuIHNvIGEgaGVhZHMtdXAuIGVuam95LCBmdXR1cmUtbWUhCgkqLwoJJ0RPTUV4Y2VwdGlvbicgOiAxLAoJJ0V2ZW50JyAgICAgICAgOiAxLAoJJ01lc3NhZ2VFdmVudCcgOiAxLAoJJ1dvcmtlck1lc3NhZ2VFdmVudCc6IDEKfTsKClsgZ2xvYmFsLCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZ2xvYmFsKSBdLmZvckVhY2goZnVuY3Rpb24gKCBvYmogKSB7CglPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyggb2JqICkuZm9yRWFjaChmdW5jdGlvbiggcHJvcCApIHsKCQlpZiggd2hpdGV5Lmhhc093blByb3BlcnR5KHByb3ApICkgewogICAgICAgICAgICByZXR1cm47CgkJfQoKICAgICAgICB0cnkgewogICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIG9iaiwgcHJvcCwgewogICAgICAgICAgICAgICAgZ2V0IDogZnVuY3Rpb24gKCkgewogICAgICAgICAgICAgICAgICAgIC8qIFRFRSBIRUUgKi8KICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoIHByb3AgKyAnIGlzIG5vdCBkZWZpbmVkJyApOwogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZSA6IGZhbHNlLAogICAgICAgICAgICAgICAgZW51bWVyYWJsZSA6IGZhbHNlCiAgICAgICAgICAgIH0pOwogICAgICAgIH0KICAgICAgICBjYXRjaCAoIGUgKSB7CiAgICAgICAgICAgIGRlbGV0ZSBvYmpbIHByb3AgXTsKCiAgICAgICAgICAgIGlmICggb2JqWyBwcm9wIF0gIT09IHVuZGVmaW5lZCApIHsKICAgICAgICAgICAgICAgIG9ialsgcHJvcCBdID0gbnVsbDsKICAgICAgICAgICAgfQogICAgICAgIH0KCX0pOwp9KTsKCk9iamVjdC5kZWZpbmVQcm9wZXJ0eSggQXJyYXkucHJvdG90eXBlLCAnam9pbicsIHsKCXdyaXRhYmxlOiBmYWxzZSwKCWNvbmZpZ3VyYWJsZTogZmFsc2UsCgllbnVtcmFibGU6IGZhbHNlLAoKCXZhbHVlOiAoZnVuY3Rpb24gKCBvbGQgKSB7CgkJcmV0dXJuIGZ1bmN0aW9uICggYXJnICkgewoJCQlpZiAoIHRoaXMubGVuZ3RoID4gNTAwIHx8IChhcmcgJiYgYXJnLmxlbmd0aCA+IDUwMCkgKSB7CgkJCQl0aHJvdyAnRXhjZXB0aW9uOiB0b28gbWFueSBpdGVtcyc7CgkJCX0KCgkJCXJldHVybiBvbGQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApOwoJCX07Cgl9KCBBcnJheS5wcm90b3R5cGUuam9pbiApKQp9KTsKCi8qIHdlIGRlZmluZSBpdCBvdXRzaWRlIHNvIGl0J2xsIG5vdCBiZSBpbiBzdHJpY3QgbW9kZSAqLwp2YXIgZXhlYyA9IGZ1bmN0aW9uICggY29kZSApIHsKCXJldHVybiBldmFsKCAndW5kZWZpbmVkO1xuJyArIGNvZGUgKTsKfQp2YXIgY29uc29sZSA9IHsKCV9pdGVtcyA6IFtdLAoJbG9nIDogZnVuY3Rpb24oKSB7CgkJY29uc29sZS5faXRlbXMucHVzaC5hcHBseSggY29uc29sZS5faXRlbXMsIGFyZ3VtZW50cyApOwoJfQp9Owpjb25zb2xlLmVycm9yID0gY29uc29sZS5pbmZvID0gY29uc29sZS5kZWJ1ZyA9IGNvbnNvbGUubG9nOwoKKGZ1bmN0aW9uKCl7CgkidXNlIHN0cmljdCI7CgoJZ2xvYmFsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICggZXZlbnQgKSB7CgkJcG9zdE1lc3NhZ2UoewoJCQlldmVudCA6ICdzdGFydCcKCQl9KTsKCgkJdmFyIGpzb25TdHJpbmdpZnkgPSBKU09OLnN0cmluZ2lmeSwgLypiYWNrdXAqLwoJCQlyZXN1bHQ7CgoJCXRyeSB7CgkJCXJlc3VsdCA9IGV4ZWMoIGV2ZW50LmRhdGEgKTsKCQl9CgkJY2F0Y2ggKCBlICkgewoJCQlyZXN1bHQgPSBlLnRvU3RyaW5nKCk7CgkJfQoKCQkvKkpTT04gZG9lcyBub3QgbGlrZSBhbnkgb2YgdGhlIGZvbGxvd2luZyovCgkJdmFyIHN0cnVuZyA9IHsKCQkJRnVuY3Rpb24gIDogdHJ1ZSwgRXJyb3IgIDogdHJ1ZSwKCQkJVW5kZWZpbmVkIDogdHJ1ZSwgUmVnRXhwIDogdHJ1ZQoJCX07CgkJdmFyIHNob3VsZF9zdHJpbmcgPSBmdW5jdGlvbiAoIHZhbHVlICkgewoJCQl2YXIgdHlwZSA9ICgge30gKS50b1N0cmluZy5jYWxsKCB2YWx1ZSApLnNsaWNlKCA4LCAtMSApOwoKCQkJaWYgKCB0eXBlIGluIHN0cnVuZyApIHsKCQkJCXJldHVybiB0cnVlOwoJCQl9CgkJCS8qbmVpdGhlciBkb2VzIGl0IGZlZWwgY29tcGFzc2lvbmF0ZSBhYm91dCBOYU4gb3IgSW5maW5pdHkqLwoJCQlyZXR1cm4gdmFsdWUgIT09IHZhbHVlIHx8IHZhbHVlID09PSBJbmZpbml0eTsKCQl9OwoKCQl2YXIgcmV2aXZlciA9IGZ1bmN0aW9uICgga2V5LCB2YWx1ZSApIHsKCQkJdmFyIG91dHB1dDsKCgkJCWlmICggc2hvdWxkX3N0cmluZyh2YWx1ZSkgKSB7CgkJCQlvdXRwdXQgPSAnJyArIHZhbHVlOwoJCQl9CgkJCWVsc2UgewoJCQkJb3V0cHV0ID0gdmFsdWU7CgkJCX0KCgkJCXJldHVybiBvdXRwdXQ7CgkJfTsKCgkJcG9zdE1lc3NhZ2UoewoJCQlhbnN3ZXIgOiBqc29uU3RyaW5naWZ5KCByZXN1bHQsIHJldml2ZXIgKSwKCQkJbG9nICAgIDoganNvblN0cmluZ2lmeSggY29uc29sZS5faXRlbXMsIHJldml2ZXIgKS5zbGljZSggMSwgLTEgKQoJCX0pOwoJfTsKfSkoKTsK' );

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
