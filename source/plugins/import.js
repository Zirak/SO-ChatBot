(function() {
    "use strict";
    
    var doImport = function (args) {
        if (args.trim() === 'clear') {
            bot.memory.clear();

            return 'Bot memory cleared. Please restart the bot.';
        }

        var req = new XMLHttpRequest();
        req.addEventListener('abort', function() {
            args.reply('Failed: Gist request aborted by user (???)');
        });
        req.addEventListener('error', function() {
            args.reply('Failed: Gist request encountered a network error');
        });
        req.addEventListener('load', function() {
            if (req.status !== 200) {
                var resp = '';
                if (req.responseText) {
                    resp = '\n' + req.responseText.match(/.{1,400}/g).join('\n');
                }
                args.reply('Failed: ' + req.status + ': ' + req.statusText + resp);
            }
    
            var resp = JSON.parse(req.responseText);
    
            bot.memory.data = JSON.parse(resp.files['bot.json'].content);
            bot.memory.save();
    
            args.reply("Imported and persisted successfully. Please restart the bot.");
        });
        req.open('GET', 'https://api.github.com/gists/' + args, true);
        req.send(null);
    };

    bot.addCommand({
        name : 'import',
        fun : doImport,
        permissions : { del : 'NONE', use : 'OWNER' },
        description : 'Imports the persistent memory described in args `/export <exported-content>`'
    });
})();
