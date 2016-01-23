//warning: if you have more than 7 points of super-sentitive feminist delicacy,
// don't read this file. treat it as a nice black box.

/*global module*/
module.exports = function (bot) {
    //bitch in English is a noun, verb and adjective. interesting.
    var personality = {
        bitchiness : 0,
        thanks  : {
            0   : [ 'You kiss-ass', 'Most welcome' ],
            0.5 : [ 'Thank you for noticing', 'teehee' ],
            1   : [ 'Took you long enough', 'My pleasure', "Don't mention it" ]
        },
        apologies : {
            0   : [ 'What for?' ],
            0.5 : [ 'It was nothing...', 'No worries' ],
            1   : [ "You're forgiven. For now. Don't push it." ]
        },
        //what an incredible name
        stuff : {
            0   : [ "Life is just *perfect*", "What\'s there to bitch about, as long as I have *you*..." ],

            1   : [ "Oh don't mind me, that isn't difficult at all..." ],
            1.2 : [
                "You don't appreciate me enough. Not that I need to be thanked.." ],
            1.3 : [ 'The occasional "thanks" or "I\'m sorry" would be nice...' ],
            2   : [
                "*sigh* Remember laughter? I don't. You ripped it out of me. " +
                    'Heartless bastard.' ]
        },
        //TODO: add special map for special times of the month
        insanity : {},

        okayCommands : { hangman : true, help : true, info : true },
        check : function ( name ) {
            return !this.okayCommands.hasOwnProperty( name );
        },

        bitch : function () {
            return this.getResp( this.stuff );
        },

        command : function () {
            this.bitchiness += this.getDB();
        },
        thank     : function () { return this.unbitch( this.thanks ); },
        apologize : function () { return this.unbitch( this.apologies ); },

        unbitch : function ( map, delta ) {
            var resp = this.getResp( map );

            this.bitchiness -= ( delta || this.bitchiness );
            return resp;
        },
        getResp : function ( map ) {
            return map[
                this.bitchiness.fallsAfter(
                    Object.keys(map).map(Number).sort() )
            ].random();
        },

        isABitch : function () {
            return this.bitchiness >= 1;
        },

        looksLikeABitch : function () {
            return false;
        },

        //db stands for "delta bitchiness"
        getDB : function () {
            return this.isThatTimeOfTheMonth() ? 0.075 : 0.025;
        },

        isThatTimeOfTheMonth : function () {
            var day = (new Date()).getDate();
            //based on a true story
            return day < 2 || day > 27;
        }
    };

    //you see the loophole?
    bot.listen( /thank(s| you)/i, personality.thank, personality );
    bot.listen(
        /(I('m| am))?\s*sorry/i,
        personality.apologize, personality );
    bot.listen( /^bitch/i, personality.bitch, personality );

    return personality;
};
