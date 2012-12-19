(function () {
/*
  ^\s*         #tolerate pre-whitespace
  s            #substitution prefix
  (.)          #delimiter declaration
  (            #begin matching regex
    (?:        #match shit which isn't an...
      (?:\\\1) #escaped delimeter
      |        #or...
      [^\1]    #anything but the delimeter
    )*?
  )            #end matching regex
  \1           #delimeter again
  (            #the fa-chizzle all over again...this time for replacement
    (?:
      (?:\\\1)
      |
      [^\1]
    )*?
  )      #read above, I'm not repeating this crap
  \1
  (      #flag capturing group
    g?   #global (optional)
    i?   #case insensitive (optional)
  )      #FIN
 */
var sub = /s(.)((?:(?:\\\1)|[^\1])*?)\1((?:(?:\\\1)|[^\1])*?)\1(g?i?)/;
bot.listen( sub, substitute );

function substitute ( msg ) {
	var re = RegExp( msg.matches[2], msg.matches[4] ),
		replacement = msg.matches[ 3 ];

	if ( !msg.matches[2] ) {
		return 'Empty regex is empty';
	}
	var message = get_matching_message( re, msg.get('message_id') );
	if ( !message ) {
		return 'No matching message (are you sure we\'re in the right room?)';
	}

	var link = message.previousElementSibling.href;
	return message.textContent.replace( re, replacement ) + ' ' +
		msg.link( '(source)', link );
}

function get_matching_message ( re, onlyBefore ) {
	var messages = [].slice.call(
		document.getElementsByClassName('content') ).reverse();
	return messages.first( matches );

	function matches ( el ) {
		var id = Number( el.parentElement.id.match(/\d+/)[0] );
		return id < onlyBefore && re.test( el.textContent );
	}
}
}());
