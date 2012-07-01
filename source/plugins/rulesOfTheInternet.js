(function () {
/*
     _____ _           ______      _                    __   _   _
    |_   _| |          | ___ \    | |                  / _| | | | |
      | | | |__   ___  | |_/ /   _| | ___  ___    ___ | |_  | |_| |__   ___
      | | |  _ \ / _ \ |    / | | | |/ _ \/ __|  / _ \|  _| | __|  _ \ / _ \
      | | | | | |  __/ | |\ \ |_| | |  __/\__ \ | (_) | |   | |_| | | |  __/
      \_/ |_| |_|\___| \_| \_\__,_|_|\___||___/  \___/|_|    \__|_| |_|\___|


                     _____      _                       _
                    |_   _|    | |                     | |
                      | | _ __ | |_ ___ _ __ _ __   ___| |_
                      | || '_ \| __/ _ \ '__| '_ \ / _ \ __|
                     _| || | | | ||  __/ |  | | | |  __/ |_
                     \___/_| |_|\__\___|_|  |_| |_|\___|\__|
*/
var rulz = [
	'1. Do not talk about /b/',
	'2. Do NOT talk about /b/',
	'3. We are Anonymous.',
	'4. Anonymous is legion.',
	'5. Anonymous does not forgive, Anonymous does not forget.',
	'6. Anonymous can be horrible, senseless, uncaring monster.',
	'7. Anonymous is still able to deliver.',
	'8. There are no real rules about posting.',
	'9. There are no real rules about moderation either — enjoy your ban.',
	'10. If you enjoy any rival sites — DON\'T.',
	'11. You must have pictures to prove your statement.',
	'12. Lurk moar — it\'s never enough.',
	'13. Nothing is Sacred.',
	'14. Do not argue with a troll — it means that they win.',
	'15. The more beautiful and pure a thing is, the more satisfying it is to corrupt it.',
	'16. There are NO girls on the internet.',
	'17. A cat is fine too.',
	'18. One cat leads to another.',
	'19. The more you hate it, the stronger it gets.',
	'20. It is delicious cake. You must eat it.',
	'21. It is delicious trap. You must hit it.',
	'22. /b/ sucks today.',
	'23. Cock goes in here.',
	'24. You will never have sex.',
	'25. ????',
	'26. PROFIT!',
	'27. It needs more Desu. No exceptions.',
	'28. There will always be more fucked up shit than what you just saw.',
	'29. You can not divide by zero (just because the calculator says so).',
	'30. No real limits of any kind apply here — not even the sky',
	'31. CAPSLOCK IS CRUISE CONTROL FOR COOL.',
	'32. EVEN WITH CRUISE CONTROL YOU STILL HAVE TO STEER.',
	'33. Desu isn\'t funny. Seriously guys. It\'s worse than Chuck Norris jokes.',
	'34. There is porn of it. No exceptions.',
	'35. If no porn is found of it, it will be created.',
	'36. No matter what it is, it is somebody\'s fetish. No exceptions.',
	'37. Even one positive comment about Japanese things can make you a weeaboo.',
	'38. When one sees a lion, one must get into the car',
	'39. There is furry porn of it. No exceptions.',
	'40. The pool is always closed due to AIDS (and stingrays, which also have AIDS).',
	'41. If there isn\'t enough just ask for Moar.',
	'42. Everything has been cracked and pirated.',
	'43. DISREGARD THAT I SUCK COCKS',
	'44. The internet is not your personal army.',
	'45. Rule 45 is a lie.',
	'46. The cake is a lie.',
	'47. If you post it, they will cum.',
	'48. It will always need moar sauce.',
	'49. The internet makes you stupid.',
	'50. Anything can be a meme.',
	'51. Longcat is looooooooooong.',
	'52. If something goes wrong, Ebaums did it.',
	'53. Anonymous is a virgin by default.',
	'54. Moot has cat ears, even in real life. No exceptions.',
	'55. CP is awwwright, but DSFARGEG will get you b&.',
	'56. Don\'t mess with football.',
	'57. MrSpooky has never seen so many ingrates.',
	'58. Anonymous does not "buy", he downloads.',
	'59. The term "sage" does not refer to the spice.',
	'60. If you say Candlejack, you w',
	'61. You cannot divide by zero.',
	'62. The internet is SERIOUS FUCKING BUSINESS.',
	'63. If you do not believe it, then it must be habeebed for great justice.',
	'64. Not even Spider-Man knows how to shot web.',
	'65. Mitchell Henderson was an hero to us all.',
	'66. This is not lupus, it\'s SPARTAAAAAAAAAA.',
	'67. One does not simply shoop da whoop into Mordor.',
	'68. Katy is bi, so deal w/it.',
	'69. LOL SIXTY NINE AMIRITE?',
	'70. Also, cocks.',
	'71. This is a showdown, a throwdown, hell no I can\'t slow down, it\'s gonna go.',
	'72. Anonymous did NOT, under any circumstances, tk him 2da bar|?',
	'73. If you express astonishment at someone\'s claim, it is most likely just a clever ruse.',
	'74. If it hadn\'t been for Cotton Eyed Joe, Anonymous would have been married a long time ago.',
	'75. Around Snacks, CP is lax.',
	'76. All numbers are at least 100 but always OVER NINE THOUSAAAAAND.',
	'77. Hal Turner definitely needs to gb2/hell/.',
	'78. Mods are fucking fags. No exceptions.',
	'79. All Caturday threads will be bombarded with Zippocat. No exceptions.',
	'80. No matter how cute it is, it probably skullfucked your mother last night.',
	'81. That\'s not mud.',
	'82. Steve Irwin\'s death is really, really funny.',
	'83. The Internet is SERIOUS FUCKING BUSINESS.',
	'84. Rule 87 is true.',
	'85. Yes, it is some chickens.',
	'86. Bobba bobba is bobba.',
	'87. Rule 84 is false. OH SHI-',
	'88. If your statement is preceded by "HAY GUYZ", then you are not doing it right.',
	'89. If you cannot understand it, it is machine code.',
	'90. Anonymous still owes Hal Turner one trillion U.S. dollars.',
	'91. Spengbab Sqarpaint is luv Padtwick Zhstar iz fwend.',
	'92. Disregard Bigmike, he sucks cocks.',
	'93. Secure tripcodes are for jerks.',
	'94. If someone herd u liek Mudkips, deny it constantly for the lulz.',
	'95. Combo breakers are inevitable. If the combo is completed successfully, it is gay.',
	'96. I am a huge faggot. Please rape my face.',
	'97. Shit sucks and will never be stickied.',
	'98. Bricks must are required to be shat whenever Anonymous is surprised.',
	'99. If you have no bricks to shit, you are made of fail and AIDS.',
	'100. ZOMG NONE',
	'101. The internet is always right. No exceptions',
	'102. The internet is really, really great, FOR PORN.'
];

function findRulz ( msg ) {
	//matches will look like this:
	// [ ruleIndex, to/and, ruleIndex ]
	var start = Math.max( msg.matches[1], 1 ) - 1,
		end = Math.min( msg.matches[3], rulz.length ),
		preposition = msg.matches[ 2 ],
		tmp, res;

	console.log( start, end, preposition, 'rulz' );

	if ( start && !end ) {
		return rulz[ start ];
	}

	if ( preposition === 'to' ) {
		if ( start > end ) {
			tmp = start;
			start = end;
			end = tmp;
		}

		res = rulz.slice( start, end );
	}
	else {
		res = [ rulz[start], rulz[end] ];
	}

	return res.join( '\n' );
}

var regex = /(?:show|tell) (?:me)? rules? (\d+)\s?(?:(,|and|to)\s?(\d+))?/;

bot.listen( regex, findRulz );
}());
