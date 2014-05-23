//execute arbitrary js code in a relatively safe environment
bot.eval = (function () {

//translation tool: http://tinkerbin.heroku.com/84dPpGFr
//just a base64 encode of codeWorker.js
var workerCode = atob( 'dmFyIGdsb2JhbCA9IHRoaXM7CgovKm1vc3QgZXh0cmEgZnVuY3Rpb25zIGNvdWxkIGJlIHBvc3NpYmx5IHVuc2FmZSovCnZhciB3aGl0ZXkgPSB7CgknQXJyYXknCQkJCSA6IDEsCgknQm9vbGVhbicJCQkgOiAxLAoJJ0RhdGUnCQkJCSA6IDEsCgknRXJyb3InCQkJCSA6IDEsCgknRXZhbEVycm9yJwkJCSA6IDEsCgknRnVuY3Rpb24nCQkJIDogMSwKCSdJbmZpbml0eScJCQkgOiAxLAoJJ0pTT04nCQkJCSA6IDEsCgknTWFwJwkJCQkgOiAxLAoJJ01hdGgnCQkJCSA6IDEsCgknTmFOJwkJCQkgOiAxLAoJJ051bWJlcicJCQkgOiAxLAoJJ09iamVjdCcJCQkgOiAxLAoJJ1Byb21pc2UnCQkJIDogMSwKCSdQcm94eScJCQkJIDogMSwKCSdSYW5nZUVycm9yJwkJIDogMSwKCSdSZWZlcmVuY2VFcnJvcicJIDogMSwKCSdSZWdFeHAnCQkJIDogMSwKCSdTZXQnCQkJCSA6IDEsCgknU3RyaW5nJwkJCSA6IDEsCgknU3ludGF4RXJyb3InCQkgOiAxLAoJJ1R5cGVFcnJvcicJCQkgOiAxLAoJJ1VSSUVycm9yJwkJCSA6IDEsCgknV2Vha01hcCcJCQkgOiAxLAoJJ1dlYWtTZXQnCQkJIDogMSwKCSdhdG9iJwkJCQkgOiAxLAoJJ2J0b2EnCQkJCSA6IDEsCgknY29uc29sZScJCQkgOiAxLAoJJ2RlY29kZVVSSScJCQkgOiAxLAoJJ2RlY29kZVVSSUNvbXBvbmVudCcgOiAxLAoJJ2VuY29kZVVSSScJCQkgOiAxLAoJJ2VuY29kZVVSSUNvbXBvbmVudCcgOiAxLAoJJ2V2YWwnCQkJCSA6IDEsCgknZXhlYycJCQkJIDogMSwgLyogb3VyIG93biBmdW5jdGlvbiAqLwoJJ2dsb2JhbCcJCQkgOiAxLAoJJ2lzRmluaXRlJwkJCSA6IDEsCgknaXNOYU4nCQkJCSA6IDEsCgknb25tZXNzYWdlJwkJCSA6IDEsCgkncGFyc2VGbG9hdCcJCSA6IDEsCgkncGFyc2VJbnQnCQkJIDogMSwKCSdwb3N0TWVzc2FnZScJCSA6IDEsCgknc2VsZicJCQkJIDogMSwKCSd1bmRlZmluZWQnCQkJIDogMSwKCSd3aGl0ZXknCQkJIDogMSwKCgkvKiB0eXBlZCBhcnJheXMgYW5kIHNoaXQgKi8KCSdBcnJheUJ1ZmZlcicJCTogMSwKCSdCbG9iJwkJCQk6IDEsCgknRmxvYXQzMkFycmF5JwkJOiAxLAoJJ0Zsb2F0NjRBcnJheScJCTogMSwKCSdJbnQ4QXJyYXknCQkJOiAxLAoJJ0ludDE2QXJyYXknCQk6IDEsCgknSW50MzJBcnJheScJCTogMSwKCSdVaW50OEFycmF5JwkJOiAxLAoJJ1VpbnQxNkFycmF5JwkJOiAxLAoJJ1VpbnQzMkFycmF5JwkJOiAxLAoJJ1VpbnQ4Q2xhbXBlZEFycmF5JyA6IDEsCgoJLyoKCXRoZXNlIHByb3BlcnRpZXMgYWxsb3cgRkYgdG8gZnVuY3Rpb24uIHdpdGhvdXQgdGhlbSwgYSBmdWNrZmVzdCBvZgoJaW5leHBsaWNhYmxlIGVycm9ycyBlbnVzZXMuIHRvb2sgbWUgYWJvdXQgNCBob3VycyB0byB0cmFjayB0aGVzZSBmdWNrZXJzCglkb3duLgoJZnVjayBoZWxsIGl0IGlzbid0IGZ1dHVyZS1wcm9vZiwgYnV0IHRoZSBlcnJvcnMgdGhyb3duIGFyZSB1bmNhdGNoYWJsZQoJYW5kIHVudHJhY2FibGUuIHNvIGEgaGVhZHMtdXAuIGVuam95LCBmdXR1cmUtbWUhCgkqLwoJJ0RPTUV4Y2VwdGlvbicgOiAxLAoJJ0V2ZW50JwkJICAgOiAxLAoJJ01lc3NhZ2VFdmVudCcgOiAxLAoJJ1dvcmtlck1lc3NhZ2VFdmVudCc6IDEKfTsKClsgZ2xvYmFsLCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZ2xvYmFsKSBdLmZvckVhY2goZnVuY3Rpb24gKCBvYmogKSB7CglPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyggb2JqICkuZm9yRWFjaChmdW5jdGlvbiggcHJvcCApIHsKCQlpZiggd2hpdGV5Lmhhc093blByb3BlcnR5KHByb3ApICkgewoJCQlyZXR1cm47CgkJfQoKCQl0cnkgewoJCQlPYmplY3QuZGVmaW5lUHJvcGVydHkoIG9iaiwgcHJvcCwgewoJCQkJZ2V0IDogZnVuY3Rpb24gKCkgewoJCQkJCS8qIFRFRSBIRUUgKi8KCQkJCQl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoIHByb3AgKyAnIGlzIG5vdCBkZWZpbmVkJyApOwoJCQkJfSwKCQkJCWNvbmZpZ3VyYWJsZSA6IGZhbHNlLAoJCQkJZW51bWVyYWJsZSA6IGZhbHNlCgkJCX0pOwoJCX0KCQljYXRjaCAoIGUgKSB7CgkJCWRlbGV0ZSBvYmpbIHByb3AgXTsKCgkJCWlmICggb2JqWyBwcm9wIF0gIT09IHVuZGVmaW5lZCApIHsKCQkJCW9ialsgcHJvcCBdID0gbnVsbDsKCQkJfQoJCX0KCX0pOwp9KTsKCk9iamVjdC5kZWZpbmVQcm9wZXJ0eSggQXJyYXkucHJvdG90eXBlLCAnam9pbicsIHsKCXdyaXRhYmxlOiBmYWxzZSwKCWNvbmZpZ3VyYWJsZTogZmFsc2UsCgllbnVtcmFibGU6IGZhbHNlLAoKCXZhbHVlOiAoZnVuY3Rpb24gKCBvbGQgKSB7CgkJcmV0dXJuIGZ1bmN0aW9uICggYXJnICkgewoJCQlpZiAoIHRoaXMubGVuZ3RoID4gNTAwIHx8IChhcmcgJiYgYXJnLmxlbmd0aCA+IDUwMCkgKSB7CgkJCQl0aHJvdyAnRXhjZXB0aW9uOiB0b28gbWFueSBpdGVtcyc7CgkJCX0KCgkJCXJldHVybiBvbGQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApOwoJCX07Cgl9KCBBcnJheS5wcm90b3R5cGUuam9pbiApKQp9KTsKCgovKiB3ZSBkZWZpbmUgaXQgb3V0c2lkZSBzbyBpdCdsbCBub3QgYmUgaW4gc3RyaWN0IG1vZGUgKi8KdmFyIGV4ZWMgPSBmdW5jdGlvbiAoIGNvZGUgKSB7CglyZXR1cm4gZXZhbCggJ3VuZGVmaW5lZDtcbicgKyBjb2RlICk7Cn07CnZhciBjb25zb2xlID0gewoJX2l0ZW1zIDogW10sCglsb2cgOiBmdW5jdGlvbigpIHsKCQljb25zb2xlLl9pdGVtcy5wdXNoLmFwcGx5KCBjb25zb2xlLl9pdGVtcywgYXJndW1lbnRzICk7Cgl9Cn07CmNvbnNvbGUuZXJyb3IgPSBjb25zb2xlLmluZm8gPSBjb25zb2xlLmRlYnVnID0gY29uc29sZS5sb2c7CgooZnVuY3Rpb24oKSB7CgkidXNlIHN0cmljdCI7CgoJZ2xvYmFsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICggZXZlbnQgKSB7CgkJZ2xvYmFsLnBvc3RNZXNzYWdlKHsKCQkJZXZlbnQgOiAnc3RhcnQnCgkJfSk7CgoJCXZhciBqc29uU3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnksIC8qYmFja3VwKi8KCQkJcmVzdWx0LAoKCQkJb3JpZ2luYWxTZXRUaW1lb3V0ID0gc2V0VGltZW91dCwKCQkJdGltZW91dENvdW50ZXIgPSAwOwoKCQl2YXIgc2VuZFJlc3VsdCA9IGZ1bmN0aW9uICggcmVzdWx0ICkgewoJCQlnbG9iYWwucG9zdE1lc3NhZ2UoewoJCQkJYW5zd2VyIDoganNvblN0cmluZ2lmeSggcmVzdWx0LCByZXZpdmVyICksCgkJCQlsb2cJICAgOiBqc29uU3RyaW5naWZ5KCBjb25zb2xlLl9pdGVtcywgcmV2aXZlciApLnNsaWNlKCAxLCAtMSApCgkJCX0pOwoJCX07CgkJdmFyIGRvbmUgPSBmdW5jdGlvbiAoIHJlc3VsdCApIHsKCQkJaWYgKCB0aW1lb3V0Q291bnRlciA8IDEgKSB7CgkJCQlzZW5kUmVzdWx0KCByZXN1bHQgKTsKCQkJfQoJCX07CgoJCXZhciByZXZpdmVyID0gZnVuY3Rpb24gKCBrZXksIHZhbHVlICkgewoJCQl2YXIgb3V0cHV0OwoKCQkJaWYgKCBzaG91bGRTdHJpbmcodmFsdWUpICkgewoJCQkJb3V0cHV0ID0gJycgKyB2YWx1ZTsKCQkJfQoJCQllbHNlIHsKCQkJCW91dHB1dCA9IHZhbHVlOwoJCQl9CgoJCQlyZXR1cm4gb3V0cHV0OwoJCX07CgoJCS8qSlNPTiBkb2VzIG5vdCBsaWtlIGFueSBvZiB0aGUgZm9sbG93aW5nKi8KCQl2YXIgc3RydW5nID0gewoJCQlGdW5jdGlvbiAgOiB0cnVlLCBFcnJvcgkgOiB0cnVlLAoJCQlVbmRlZmluZWQgOiB0cnVlLCBSZWdFeHAgOiB0cnVlCgkJfTsKCQl2YXIgc2hvdWxkU3RyaW5nID0gZnVuY3Rpb24gKCB2YWx1ZSApIHsKCQkJdmFyIHR5cGUgPSAoIHt9ICkudG9TdHJpbmcuY2FsbCggdmFsdWUgKS5zbGljZSggOCwgLTEgKTsKCgkJCWlmICggdHlwZSBpbiBzdHJ1bmcgKSB7CgkJCQlyZXR1cm4gdHJ1ZTsKCQkJfQoJCQkvKm5laXRoZXIgZG9lcyBpdCBmZWVsIGNvbXBhc3Npb25hdGUgYWJvdXQgTmFOIG9yIEluZmluaXR5Ki8KCQkJcmV0dXJuIHZhbHVlICE9PSB2YWx1ZSB8fCB2YWx1ZSA9PT0gSW5maW5pdHk7CgkJfTsKCgkJc2VsZi5zZXRUaW1lb3V0ID0gZnVuY3Rpb24gKGNiKSB7CgkJCXZhciBhcmdzID0gW10uc2xpY2UuY2FsbCggYXJndW1lbnRzICk7CgkJCWFyZ3NbIDAgXSA9IHdyYXBwZXI7CgkJCXRpbWVvdXRDb3VudGVyICs9IDE7CgoJCQlvcmlnaW5hbFNldFRpbWVvdXQuYXBwbHkoIHNlbGYsIGFyZ3MgKTsKCgkJCWZ1bmN0aW9uIHdyYXBwZXIgKCkgewoJCQkJdGltZW91dENvdW50ZXIgLT0gMTsKCQkJCWNiLmFwcGx5KCBzZWxmLCBhcmd1bWVudHMgKTsKCgkJCQlkb25lKCk7CgkJCX0KCQl9OwoKCQl0cnkgewoJCQlyZXN1bHQgPSBleGVjKCBldmVudC5kYXRhICk7CgkJfQoJCWNhdGNoICggZSApIHsKCQkJcmVzdWx0ID0gZS50b1N0cmluZygpOwoJCX0KCgkJLypoYW5kbGUgcHJvbWlzZXMgYXBwcm9wcmlhdGVseSovCgkJaWYgKCByZXN1bHQgJiYgcmVzdWx0LnRoZW4gJiYgcmVzdWx0LmNhdGNoICkgewoJCQlyZXN1bHQudGhlbiggZG9uZSApLmNhdGNoKCBkb25lICk7CgkJfQoJCWVsc2UgewoJCQlkb25lKCByZXN1bHQgKTsKCQl9Cgl9Owp9KSgpOwo=' );

var blob = new Blob( [workerCode], { type : 'application/javascript' } ),
	codeUrl = window.URL.createObjectURL( blob );

setTimeout(function () {
	if (bot.devMode) {
		return;
	}
	IO.injectScript( 'https://raw.github.com/jashkenas/coffee-script/master/extras/coffee-script.js' );
}, 1000);

return function ( code, cb ) {
	var worker = new Worker( codeUrl ),
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
		finish( error.message );
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
		ret = '`' +	 str.slice(0, 400) + '` (snip)';
	}
	else {
		ret = '`' + str +'`';
	}

	return ret;
}
}());
