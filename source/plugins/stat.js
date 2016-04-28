module.exports = function (bot) {
    'use strict';

// how an API response looks like:
/*
  {
    "badge_counts": {
      "bronze": 54,
      "silver": 31,
      "gold": 3
    },
    "answer_count": 181,
    "question_count": 15,
    "reputation_change_day": 0,
    "reputation": 11847,
    "user_id": 617762,
    "link": "http://stackoverflow.com/users/617762/zirak",
    "display_name": "Zirak"
  }
*/
// the query filter we use is:
/*
  .wrapper.error_id
           error_message
           error_name
           items
           quota_max
           quota_remaining
  badge_count.* (gold, silver, bronze)
  user.answer_count
       badge_counts
       display_name
       link
       question_count
       reputation
       reputation_change_day
       user_id
*/

    var template = '{displayName} ({link}) '       +
        '{indicative} {reputation} reputation, '   +
        '{verb} {reputationChangeDay} rep today, ' +
        'asked {questionCount} questions, '        +
        'gave {answerCount} answers, '             +
        'for a q:a ratio of {ratio}.\n'            +
        'avg. rep/post: {avgRepPost}. Badges: '    +
        '{gold}g {silver}s {bronze}b ';

    function stat (msg, cb) {
        var args = msg.parse(),
            id = args[0];

        if (!id) {
            id = msg.get('user_id');
        }
        else if (!/^\d+$/.test(id)) {
            id = msg.findUserId(args.length > 1 ? id : args.join(' '));
        }

        if (id < 0) {
            return 'User Elusio proved elusive.';
        }

        // ~10% chance
        if (Math.random() <= 0.1) {
            finish('That dude sucks');
            return;
        }

        bot.IO.jsonp({
            url: 'https://api.stackexchange.com/2.2/users/' + id,
            data: {
                site: bot.adapter.site,
                // see top of file.
                filter:  '!P)usXx8OGi3Eq5LdDJke7ybvCSm_vuVGrSDZs3)UmEI'
            },
            fun: done
        });

        function done(resp) {
            bot.IO.normalizeUnderscoreProperties(resp);

            if (resp.errorMessage) {
                finish(resp.errorMessage);
                return;
            }

            var user = resp.items[0], res;
            if (!user) {
                res = 'User ' + id + ' not found';
            }
            else {
                bot.IO.normalizeUnderscoreProperties(user);
                res = handleUserObject(user, msg);
            }

            finish(res);
        }

        function finish (res) {
            if (cb) {
                cb(res);
            }
            else {
                msg.reply(res);
            }
        }
    }

    function handleUserObject(user, msg) {
        user = normalizeStats(user);

        // #177: Decode html entities in user names, and special-case a user
        // asking about themselves.
        if (user.user_id === msg.get('user_id')) {
            // You (link) have ...
            user.displayName = 'You';
            user.indicative = 'have';
        }
        else {
            // Bob (link) has ...
            user.displayName = bot.IO.decodehtmlEntities(user.displayName);
            user.indicative = 'has';
        }

        if (user.reputationChangeDay < 0) {
            user.verb = 'lost';
            user.reputationChangeDay = Math.abs(user.reputationChangeDay);
        }
        else {
            user.verb = 'earned';
        }

        return template.supplant(user);
    }

    function normalizeStats(stats) {
        stats = Object.merge({
            questionCount: 0,
            answerCount: 0,
            reputationChangeDay: 0
        }, stats.badge_counts, stats);

        stats = Object.merge(stats.badge_counts, stats);

        // avg = rep / (questions + answers)
        stats.avgRepPost = (
            stats.reputation / (stats.questionCount + stats.answerCount)
        ).maxDecimal(2);

        // 1 / 0 === Infinity
        if (stats.avgRepPost === Infinity) {
            stats.avgRepPost = 'T͎͍̘͙̖̤̉̌̇̅ͯ͋͢͜͝H̖͙̗̗̺͚̱͕̒́͟E̫̺̯͖͎̗̒͑̅̈ ̈ͮ̽ͯ̆̋́͏͙͓͓͇̹<̩̟̳̫̪̇ͩ̑̆͗̽̇͆́ͅC̬͎ͪͩ̓̑͊ͮͪ̄̚̕Ě̯̰̤̗̜̗͓͛͝N̶̴̞͇̟̲̪̅̓ͯͅT͍̯̰͓̬͚̅͆̄E̠͇͇̬̬͕͖ͨ̔̓͞R͚̠̻̲̗̹̀>̇̏ͣ҉̳̖̟̫͕ ̧̛͈͙͇͂̓̚͡C͈̞̻̩̯̠̻ͥ̆͐̄ͦ́̀͟A̛̪̫͙̺̱̥̞̙ͦͧ̽͛̈́ͯ̅̍N̦̭͕̹̤͓͙̲̑͋̾͊ͣŅ̜̝͌͟O̡̝͍͚̲̝ͣ̔́͝Ť͈͢ ̪̘̳͔̂̒̋ͭ͆̽͠H̢͈̤͚̬̪̭͗ͧͬ̈́̈̀͌͒͡Ơ̮͍͇̝̰͍͚͖̿ͮ̀̍́L͐̆ͨ̏̎͡҉̧̱̯̤̹͓̗̻̭ͅḐ̲̰͙͑̂̒̐́̊';
        }

        stats.ratio = calcQARatio(stats.questionCount, stats.answerCount);

        bot.log(stats, '/stat normalized');
        return stats;
    }

    function calcQARatio(questions, answers) {
        // for teh lulz
        if (!questions && answers) {
            return 'H̸̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ';
        }
        else if (!answers && questions) {
            return 'TO͇̹̺ͅƝ̴ȳ̳ TH̘Ë͖́̉ ͠P̯͍̭O̚​N̐Y̡';
        }
        else if (!answers && !questions) {
            return 'http://i.imgur.com/F79hP.png';
        }

        return Math.ratio(questions, answers);
    }

    var cmd = {
        name: 'stat',
        fun: stat,
        permissions: {
            del: 'NONE'
        },

        description: 'Gives useless stats on a user. ' +
            '`/stat usrid|usrname [extended]`',
        async: true
    };

    bot.addCommand(cmd);

    // alias for rlemon.
    var statsCmd = Object.merge(cmd, { name: 'stats' });
    bot.addCommand(statsCmd);

};
