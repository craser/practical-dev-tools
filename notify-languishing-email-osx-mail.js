var vips = [
            /rfukunaga@pacificsunwear.com/
            ];

var team = [
            /mirigoyen@pacificsunwear.com/
            ];

var bounds = {
    vips: [ 5, 10 ],
    team: [ 10, 20 ],
    fallback: [ 20, 40 ]
};

function getSenders() {
    var a = [];
    vips.forEach(function(vip) {
            a.push([ vip, bounds.vips[0], bounds.vips[1] ]);
        });
    team.forEach(function(vip) {
            a.push([ vip, bounds.team[0], bounds.team[1] ]);
        });
    a.push([ /.*/, 20, 40]); // default;
    
    return a;
}

function getSenderProfile(sender) {
    console.log("sender: " + sender);
    var senders = getSenders();
    for (var i = 0; i < senders.length; i++) {
        var profile = senders[i];
        if (profile[0].test(sender)) {
            return profile;
        }
    }
    return [/.*/, bounds.fallback[0], bound.fallback[1]]; // default;
}

function getMaxUnread(message) {
    var sender = message.sender.get();
    var profile = getSenderProfile(sender);
    return profile[1];
}

function getMaxUnanswered(message) {
    var sender = message.sender.get();
    var profile = getSenderProfile(sender);
    return profile[2];
}

function checkMailbox(mailbox) {
    var boxResults = {
        unread: 0,
        unanswered: 0
    };
    console.log(mailbox.messages.length + " messages in " + mailbox.name.get());
    for (var i = 0; i < mailbox.messages.length; i++) {
        var message = mailbox.messages[i].get();
        var read = message.readStatus.get();
        var replied = message.wasRepliedTo.get();
        var now = new Date().getTime() / 1000;
        var received = message.dateReceived.get().getTime() / 1000;
        var age = Math.round((now - received) / 60);
        var maxUnread = getMaxUnread(message);
        var maxUnanswered = getMaxUnanswered(message);
        console.log("message: " + message);
        console.log("    read: " + read);
        console.log("    replied: " + replied);
        console.log("    received: " + received);
        console.log("    age: " + age + " minutes.");
        console.log("    maxUnread: " + maxUnread);
        console.log("    maxUnanswered: " + maxUnanswered);
        if (!read && (age > maxUnread)) {
            boxResults.unread++;
        }
        else if (!replied && (age > maxUnanswered)) {
            boxResults.unanswered++;
        }
        else {
            console.log("message was read/received " + age + " minutes ago.");
        }
    }
    return boxResults;
}

function checkAccount(account) {
    var accountResults = {
        unread: 0,
        unanswered: 0
    };
    for (var i = 0; i < account.mailboxes.length; i++) {
        var mailbox = account.mailboxes[i].get();
        var name = mailbox.name.get();
        console.log("mailbox: " + name);
        if (/inbox/i.test(name)) {
            var results = checkMailbox(mailbox);
            accountResults.unread += results.unread;
            accountResults.unanswered += results.unanswered;
        }
        else {
            console.log("Not scanning: " + name);
        }
    }
    return accountResults;
}

function checkInboxes() {
    var mail = Application("Mail")
        var unread = 0;
    var unanswered = 0;
    for (var i = 0; i < mail.accounts.length; i++) {
        var account = mail.accounts[i].get();
        console.log("account: " + account.name)
            var results = checkAccount(mail.accounts[i]);
        unread += results.unread;
        unanswered += results.unanswered;
    }
    console.log("unread    : " + unread);
    console.log("unanswered: " + unanswered);
    return {
        unread: unread,
            unanswered: unanswered
            };
}

function checkForLanguishingEmail() {
    var results = checkInboxes();
    if (results.unread || results.unanswered) {
        var app = Application.currentApplication(); //Application("Finder")
        app.includeStandardAdditions = true; // This is not obvious, and not discoverable, and makes me want to punch someone. 
        var text = "Languishing email: " + results.unread + " unread, " + results.unanswered + " unanswered.";
        var BUTTON_IGNORE = "Ignore";
        var BUTTON_READ_NOW = "Read Now";
        var input = app.displayDialog(text, {
                buttons: [ BUTTON_IGNORE, BUTTON_READ_NOW ],
                defaultButton: BUTTON_IGNORE
                
            });
        console.log("Button: " + input.buttonReturned);
        if (BUTTON_READ_NOW == input.buttonReturned) {
            Application("Mail").activate();
        }
        return 10;
    }
    else {
        return 1;
    }
}

function run() {
    for (var i = 0; i < arguments.length; i++) {
        console.log("[" + i + "]: " + arguments[i]);
    }
    
    return (!Application("Mail").frontmost())
        ? checkForLanguishingEmail()
        : 1;
}


