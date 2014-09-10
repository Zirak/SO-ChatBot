(function() {
    "use strict";

    bot.addCommand({
        name : 'import',
        fun : function (args) { 
            if (args.trim() === 'clear') {
                bot.memory.clear();
                
                return 'Bot memory cleared. Please restart the bot.';
            }
        
            var req = new XMLHttpRequest();
            req.open('GET', 'https://api.github.com/gists/' + args, false);
            req.send(null);
            
            if (req.status !== 200) {
                var resp = '';
                if (req.responseText) {
                    resp = '\n' + req.responseText.match(/.{1,400}/g).join('\n');
                }
                return 'Failed: ' + req.status + ': ' + req.statusText + resp;
            }
            
            var resp = JSON.parse(req.responseText);
            
            bot.memory.data = JSON.parse(resp.files['bot.json'].content);
            bot.memory.save();

            return "Imported and persisted successfully. Please restart the bot.";
        },
        permissions : { del : 'NONE', use : 'OWNER' },
        description : 'Imports the persistent memory described in args `/export <exported-content>`'
    });
})();
