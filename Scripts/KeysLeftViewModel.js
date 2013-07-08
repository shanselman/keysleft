var KeysLeftViewModel = function (age, wpm) {
    this.age = ko.observable(age);
    this.wpm = ko.observable(wpm);
    this.dead = ko.observable(90);
    this.hoursTyping = ko.observable(4);
    this.averageWordLength = ko.observable(5);
    this.weeksInAYear = ko.observable(48);
    this.novelLength = ko.observable(600000);
    this.programSize = ko.observable(500000);

    //math variables
    this.yearsLeft = ko.computed(function () {
        return this.dead() - this.age();
    }, this);

    this.keystrokesLeft = ko.computed(function () {
        return (this.yearsLeft() * this.weeksInAYear() * this.hoursTyping() * 60 * this.wpm() * this.averageWordLength());
    }, this);

    this.tweetsLeft = ko.computed(function () {
        return Math.floor((this.keystrokesLeft() / 140));
    }, this);

    this.emailsLeft = ko.computed(function () {
        return Math.floor(((this.keystrokesLeft() / 1000) * this.averageWordLength()));
    }, this);

    this.loveLettersLeft = ko.computed(function () {
        return Math.floor((this.keystrokesLeft() / this.averageWordLength() / 2000));
    }, this);

    this.novelsLeft = ko.computed(function () {
        return Math.floor((this.keystrokesLeft() / (this.averageWordLength() * this.novelLength())));
    }, this);

    this.programsLeft = ko.computed(function () {
        return Math.floor((this.keystrokesLeft() / this.programSize()));
    }, this);

    //Formatted string variables

    this.yearsLeftLocale = ko.computed(function () {
        return this.yearsLeft().toLocaleString();
    }, this);

    this.keystrokesLeftLocale = ko.computed(function () {
        return this.keystrokesLeft().toLocaleString();
    }, this);

    this.tweetsLeftLocale = ko.computed(function () {
        return this.tweetsLeft().toLocaleString();
    }, this);

    this.emailsLeftLocale = ko.computed(function () {
        return this.emailsLeft().toLocaleString();
    }, this);

    this.loveLettersLeftLocale = ko.computed(function () {
        return this.loveLettersLeft().toLocaleString();
    }, this);

    this.novelsLeftLocale = ko.computed(function () {
        return this.novelsLeft().toLocaleString();
    }, this);

    this.programsLeftLocale = ko.computed(function () {
        return this.programsLeft().toLocaleString();
    }, this);

    this.shouldDisplay = ko.computed(function () {
        var toShow = true;

        if (isNaN(this.age()) || isNaN(this.wpm())) {
            toShow = false;
        }

        return toShow;

        }, this);

        this.urlWithQ = ko.computed(function () {
            var url = [location.protocol, '//', location.host, location.pathname].join('');
            url += "?age=" + this.age() + "&wpm=" + this.wpm();
            return url;
        }, this);

        this.tweetText = ko.computed(function () {
            return "I have only " + this.keystrokesLeftLocale() + " keystrokes left before I die. ";
        }, this);

        this.tweetDeath = ko.computed(function () {
            var url = this.urlWithQ();
            return "http://twitter.com/intent/tweet?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(this.tweetText());
        }, this);

    };