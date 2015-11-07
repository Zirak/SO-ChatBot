(function() {
    "use strict";

    var doExport = function(args) {
        var req = new XMLHttpRequest();
        req.addEventListener('abort', function() {
            args.reply('Failed: Gist request aborted by user (???)');
        });
        req.addEventListener('error', function() {
            args.reply('Failed: Gist request encountered a network error');
        });
        req.addEventListener('load', function() {
            if (req.status !== 201) {
                var resp = '';
                if (req.responseText) {
                    resp = '\n' + req.responseText.match(/.{1,400}/g).join('\n');
                }
                args.reply('Failed: ' + req.status + ': ' + req.statusText + resp);
            }
    
            var resp = JSON.parse(req.responseText);
    
            args.reply('Exported to gist, id: `' + resp.id + '` viewable at ' + resp.html_url);
        });
        req.open('POST', 'https://api.github.com/gists', true);
        req.send(JSON.stringify({
            files: {
                'bot.json': {
                    content: JSON.stringify(bot.memory.data)
                }
            }
        }));
    };

    bot.addCommand({
        name : 'export',
        fun : doExport,
        permissions : { del : 'NONE', use : 'OWNER' },
        description : 'Blurts out a message with the persistent memory storage for export `/export`'
    });
})();
