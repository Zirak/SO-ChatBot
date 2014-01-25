(function () {
// This is a proxy to add padding to a JSON API
// See: https://github.com/shea-sollars/sap
var requestURI = 'http://www.lobby.ws/api/sap.js';

function checkDomain ( msgObj, cb ) {
	IO.jsonp({
		data : {
			domain : msgObj.content
		},
		url : requestURI,
		fun : reportResult,
		jsonpName : 'cb'
	});

	/*
	expect respObj to be:
	{
		status : 'error' || 'success',
		status_desc : 'Error message' (if status == error),
		domain : 'Domain in question' || null (possibly if error),
		available : true || false || null (possibly if error)
	}
	*/
	function reportResult ( respObj ) {
		var error = getError( respObj );

		if ( error ) {
			finish( error );
			return;
		}

		var respFormat = 'The domain {0} {1} available.',
			available = respObj.available ? '*IS*' : 'is *NOT*';

		finish( respFormat.supplant(respObj.domain, available) );
	}

	function getError ( respObj ) {
		var statusError = 'An error occured';

		var errored =
			!respObj.hasOwnProperty('status') ||
			respObj.status !== 'success';

		if ( errored ) {
			if ( respObj.status_desc ) {
				statusError += ': ' + respObj.status_desc;
			}

			return statusError;
		}

		errored = !( respObj.hasOwnProperty( 'domain' ) &&
					respObj.hasOwnProperty( 'available' ) );

		if ( errored ) {
			return 'Something went wrong with that request. Try again';
		}

		return false;
	}

	function finish ( resp ) {
		if ( cb && cb.call ) {
			cb( resp );
		}
		else {
			msgObj.reply( resp );
		}
	}
}

bot.addCommand({
	name : 'domain',
	fun : checkDomain,

	permissions : {
		del : 'NONE'
	},
	description : 'Check domain availability',
	async : true
});

}());
