(function() {
    "use strict";

    bot.addCommand({
        name : 'export',
        fun : function(args) {
            var req = new XMLHttpRequest();
            req.open('POST', 'https://api.github.com/gists', false);
            req.send(JSON.stringify({
                files: {
                    'bot.json': {
                        content: JSON.stringify(bot.memory.data)
                    }
                }
            }));
            
            if (req.status !== 201) {
                var resp = '';
                if (req.responseText) {
                    resp = '\n' + req.responseText.match(/.{1,400}/g).join('\n');
                }
                return 'Failed: ' + req.status + ': ' + req.statusText + resp;
            }
            
            var resp = JSON.parse(req.responseText);
            
            return 'Exported to gist, id: `' + resp.id + '` viewable at ' + resp.html_url;
        }, 
        permissions : { del : 'NONE', use : 'OWNER' },
        description : 'Blurts out a message with the persistent memory storage for export `/export`'
    });
})();
