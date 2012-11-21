IO.unregister('output', bot.adapter.out.build);
IO.unregister('afteroutput', bot.adapter.out.send);

bot.invocationPattern = '';

bot.adapter = {
    roomid: 0,
    transform: $D,
    escape: $D,
    reply: $D,
    directreply: $D,

    //these should be rewritten
    codify: $D,
    link: $D

};

bot.adapter. in = {
    ENTER: 13,
    elem: document.getElementById('input'),
    send: document.getElementById('send'),
    init: function() {
        this.elem.addEventListener('keyup', this.listen.bind(this), false);
        this.send.addEventListener('click', this.listenClick.bind(this), false);
    },
    listenClick: function(e) {
        this.elem.disabled = true;
        this.submit.apply(this);
    },
    listen: function(e) {
        if (e.which !== this.ENTER) {
            return;
        }
        this.listenClick.apply(this);
    },
    submit: function() {
        IO. in .receive({
            content: this.elem.value,
            user_name: 'Anonymo',
            user_id: 5138008,
            room_id: bot.adapter.roomid
        });
        IO. in .flush();
    }
};


var output = bot.adapter.out = {
    elem: document.getElementById('chat'),
    messages: [],
    bot_ident_image: (function() {
        var img = document.createElement('img');
        img.src = "http://www.gravatar.com/avatar/2d7aced56559de2ecc26577fd1cba614?s=32&d=identicon&r=PG";
        return img;
    }()),
    add: function(msg) {
        IO.out.receive({
            text: msg + '\n'
        });
    },
    build: function(obj) {
        this.messages.push(obj.text);
    },
    send: function() {
        var self = this;
        this.messages.map(wrap).forEach(append);
        this.messages = [];

        function wrap(message) {
            var cont = document.createElement('div'),
                ident = self.bot_ident_image.cloneNode(true),
                text = document.createElement('div');
            cont.className = "message";
            ident.className = "ident";
            text.className = "text";
            text.innerHTML = parseMessage(message); // don't hate, appreciate!
            cont.appendChild(ident);
            cont.appendChild(text);
            return cont;
        }

        function parseMessage(message) {
            ret = message.replace(/(^|\s)(\b(https?|ftp):\/\/[\-A-Z0-9+\u0026@#\/%?=~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~_|])/gi, "$1<a href='$2'>$2</a>");
            return ret;
        }

        function append(cont) {
            self.elem.appendChild(cont);
            bot.adapter. in .elem.value = "";
            bot.adapter. in .elem.disabled = false;
        }
    },

    loopage: function() {
        var that = this;
        setTimeout(function() {
            IO.out.flush();
            that.loopage();
        }, 1000);
    }
};

bot.adapter. in .init();
output.loopage();

IO.register('output', output.build, output);
IO.register('afteroutput', output.send, output);

function $D(x) {
    return x;
}

bot.adapter.in.elem.focus();