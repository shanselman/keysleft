function KeysLeftViewModel(age, wpm) {
            var self = this;

            self.age = ko.observable(age);
            self.wpm = ko.observable(wpm);
            self.dead = 90;
            self.hoursTyping = 4;
            self.averageWordLength = 5;
            self.weeksInAYear = 48;
            self.novelLength = 600000;
            self.programSize = 500000;
            self.secondsPerYear = 31557600;
            self.observableKeys = ko.observable();
            //math variables

            self.yearsLeft = ko.computed(function () {
                return self.dead - self.age();
            }, self);


            self.keystrokesLeft = ko.computed(function () {
                var keystrokes = (self.yearsLeft() * self.weeksInAYear * self.hoursTyping * 60 * self.wpm() * self.averageWordLength);
                self.observableKeys(keystrokes);
                return keystrokes;
            }, self);

            self.charPerSecond = ko.computed(function () {
                var secondsLeftToLive = self.secondsPerYear * self.yearsLeft();
                var toReturn = 0;
                if (secondsLeftToLive != 0)
                    toReturn = self.keystrokesLeft() / secondsLeftToLive;
                return toReturn;
            }, self);

            self.tweetsLeft = ko.computed(function () {
                return Math.floor((self.observableKeys() / 140));
            }, self);

            self.emailsLeft = ko.computed(function () {
                return Math.floor(((self.observableKeys() / 1000) * self.averageWordLength));
            }, self);

            self.loveLettersLeft = ko.computed(function () {
                return Math.floor((self.observableKeys() / self.averageWordLength / 2000));
            }, self);

            self.novelsLeft = ko.computed(function () {
                return Math.floor((self.observableKeys() / (self.averageWordLength * self.novelLength)));
            }, self);

            self.programsLeft = ko.computed(function () {
                return Math.floor((self.observableKeys() / self.programSize));
            }, self);

            //Formatted string variables

            self.yearsLeftLocale = ko.computed(function () {
                return self.yearsLeft().toLocaleString();
            }, self);

            self.keystrokesLeftLocale = ko.computed(function () {
                return self.observableKeys().toLocaleString();
            }, self);

            self.tweetsLeftLocale = ko.computed(function () {
                return self.tweetsLeft().toLocaleString();
            }, self);

            self.emailsLeftLocale = ko.computed(function () {
                return self.emailsLeft().toLocaleString();
            }, self);

            self.loveLettersLeftLocale = ko.computed(function () {
                return self.loveLettersLeft().toLocaleString();
            }, self);

            self.novelsLeftLocale = ko.computed(function () {
                return self.novelsLeft().toLocaleString();
            }, self);

            self.programsLeftLocale = ko.computed(function () {
                return self.programsLeft().toLocaleString();
            }, self);

            self.shouldDisplay = ko.computed(function () {
                var toShow = true;


                if (isNaN(self.age()) || isNaN(self.wpm())) {
                    toShow = false;
                }

                return toShow;

            }, self);

            self.urlWithQ = ko.computed(function () {
                var url = [location.protocol, '//', location.host, location.pathname].join('');
                url += "?age=" + self.age() + "&wpm=" + self.wpm();
                return url;
            }, self);

            self.tweetText = ko.computed(function () {
                return "I have only " + self.keystrokesLeftLocale() + " keystrokes left before I die. ";
            }, self);
            self.tweetDeath = ko.computed(function () {
                var url = self.urlWithQ();
                return "http://twitter.com/intent/tweet?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(self.tweetText());
            }, self);




        }