(function () {
"use strict";

//ths fnctn tks sntnc nd trns t t awsm
//md fr jvscrpt rm
// http://chat.stackoverflow.com/transcript/message/7491494#7491494
var mk_awsm=function(sntnc){
    return sntnc.split(' ').map(function(wrd){
        return 1>=wrd.length?wrd:
            2==wrd.length?wrd[0]:
            /:.*(.)/.test(wrd)?wrd.replace(/:.*(.)/, '$1'):
            wrd.split('').map(function(c,i){
                return 0!=i&&('a'==c||'e'==c||'o'==c||'u'==c||'i'==c||(1!=i%2&&.15>Math.random()))
                    ? '' : c
            }).join('')
    }).join(' ')
}

bot.addCommand({
	name : 'awsm',
	fun : mk_awsm,

	permissions : {
		del : 'NONE'
	},
	description : 'tks a sntnc and trns i awsm'
});

IO.register( 'input', function ( msgObj ) {
	var content = msgObj.content;

	if (
		//only 5% chance
		Math.random() > 0.05 ||
			//no dealing with special users
			msgObj.user_id < 1 ||
			//no playing with yourself (TODO: change...)
			msgObj.user_id === 1839506 ||
			//no messing around with invocations
			content.startsWith(bot.invocationPattern) ||
			//no code tinkering
			content.startsWith('<pre') ||
			content.startsWith('<code') ||
			//no multi-line messages
			content.startsWith("<div class='full'")
	) {
		return;
	}

	bot.adapter.out.add( mk_awsm(content), msgObj.room_id );
});

}());
