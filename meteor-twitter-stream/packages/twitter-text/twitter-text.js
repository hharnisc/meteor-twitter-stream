// file: twitter.js
twittertext = Npm.require("twitter-text");
twittertextFacade = {
  get: function(options) {
    return new twittertext(options);
  }
};