//bitch in English is a noun, verb and adjective. interesting.
bot.personality = {
	bitchiness : 0,
	thanks  : {
		0   : [ 'You kiss-ass' ],
		0.5 : [ 'Thank you for noticing', 'teehee' ],
		1   : [ 'Took you long enough', 'My pleasure', "Don't mention it" ],
	},
	apologies : {
		0   : [ 'What for?' ],
		0.5 : [ 'It was nothing...', 'No worries' ],
		1   : [ "You're forgiven. For now. Don't push it." ]
	},
	//what an incredible name
	stuff : {
		0.7 : [ "Oh don't mind me, that isn't difficult at all..." ],
		0.8 : [ "You don't appreciate me enough" ],
		0.9 : [ "The occasional 'thanks' or 'I'm sorry' would be nice..." ],
		1   : [
			"*sigh* Remember laughter? I don't. You ripped it out of me. " +
				"Heartless bastard." ]
	},
	//TODO: add special map for special times of the month
	insanity : {},

	bitch : function () {
		return this.getResp( this.stuff );
	},

	command : function () {
		this.bitchiness += this.getDB();
	},

	thank     : function () { this.unbitch( this.thanks ); },
	apologize : function () { this.unbitch( this.apologies ); },

	unbitch : function ( map ) {
		var resp = this.getResp( map );

		this.bitchiness -= ( delta || this.bitchiness );
		return resp;
	},
	getResp : function ( map ) {
		return map[
			this.bitchiness.fallsAfter( Object.keys(map) )
		].random();
	},

	isABitch : function () {
		return this.bitchiness > 1;
	},

	looksLikeABitch : function () {
		return false;
	},

	//db stands for "delta bitchiness"
	getDB : function () {
		return this.isThatTimeOfTheMonth() ? 0.1 : 0.05;
	},

	isThatTimeOfTheMonth : function () {
		var day = (new Date).getDate();
		//based on a true story
		return day < 2 || day > 27;
	}
};
