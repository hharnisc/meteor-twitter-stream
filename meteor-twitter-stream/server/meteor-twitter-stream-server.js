Tweet = new Meteor.Collection("tweet");
if (Meteor.isServer) { 
  Meteor.startup(function () {
    // connect the twitter api
    var twit = new twitter({
      consumer_key: '<your key here>',
      consumer_secret: '<your key here>',
      access_token_key: '<your key here>',
      access_token_secret: '<your key here>'
    });

    var transitions = [25,24,21,20,19,16,14,12,10];
    var sizes = [20,18,16,14];
    var Fiber = Npm.require('fibers');

    // callback for data
    twit.stream('statuses/sample', {'language': 'en'}, function(stream) {
        stream.on('data', function(data) {
            Fiber( function() {
              if (!!data.text && !!data.user.screen_name && Tweet.find().count() < 10) {
                var now = (new Date()).getTime();
                var randT = Math.floor(Math.random() * transitions.length);
                var randS = Math.floor(Math.random() * sizes.length);
                Tweet.insert({
                  text: twittertext.autoLink(data.text),
                  author: twittertext.autoLink('@' + data.user.screen_name),
                  transition: transitions[randT],
                  added: now,
                  size: sizes[randS],
                  x: 101,
                  y: Math.floor(Math.random() * 90)
                });
              }
            }).run();
        });
    });
  });

  Meteor.setInterval(function () {
    // remove any tweets that have gone off screen
    var now = (new Date()).getTime()
    var tweets = Tweet.find({});
    tweets.forEach(function (tweet) {
      if (now > tweet.added + ((tweet.transition + 2) * 1000)){
        Tweet.remove(tweet._id);
      }
    });
  }, 1000/20);
}
