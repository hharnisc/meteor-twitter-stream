Tweet = new Meteor.Collection("tweet");
if (Meteor.isClient) {
  var startup = (new Date()).getTime();
  Template.display.tweets = function () {
    return Tweet.find({added: {$gt: startup}});
  };

  Template.tweet.rendered = function() {
    $("#" + this.data._id).html(
      '<div class="text">'
        + this.data.text 
        + '<div class="author"> - ' 
        + this.data.author 
        + "</div></div>");
    var that = this;
    setTimeout(function() {
      $("#" + that.data._id).css({left: "-100%"});
    }, 100);
  };
}

if (Meteor.isServer) { 
  Meteor.startup(function () {
    // connect the twitter api
    var twit = new twitter({
      consumer_key: '<ADD YOUR STUFF HERE>',
      consumer_secret: '<ADD YOUR STUFF HERE>',
      access_token_key: '<ADD YOUR STUFF HERE>',
      access_token_secret: '<ADD YOUR STUFF HERE>'
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
                  text: linkify(data.text),
                  author: linkify('@' + data.user.screen_name),
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

  // Convert URLs (w/ or w/o protocol), @mentions, and #hashtags into anchor links
  function linkify(text) {
    var base_url = 'http://twitter.com/'; // identica: 'http://identi.ca/'
    var hashtag_part = 'search?q=#';    // identica: 'tag/'
    // convert URLs into links
    text = text.replace(
      /(>|<a[^<>]+href=['"])?(https?:\/\/([-a-z0-9]+\.)+[a-z]{2,5}(\/[-a-z0-9!#()\/?&.,]*[^ !#?().,])?)/gi,
      function($0, $1, $2) {
        return ($1 ? $0 : '<a href="' + $2 + '" target="_blank">' + $2 + '</a>');
      });
    // convert protocol-less URLs into links    
    text = text.replace(
      /(:\/\/|>)?\b(([-a-z0-9]+\.)+[a-z]{2,5}(\/[-a-z0-9!#()\/?&.]*[^ !#?().,])?)/gi,
      function($0, $1, $2) {
        return ($1 ? $0 : '<a href="http://' + $2 + '">' + $2 + '</a>');
      });
    // convert @mentions into follow links
    text = text.replace(
      /(:\/\/|>)?(@([_a-z0-9\-]+))/gi,
      function($0, $1, $2, $3) {
        return ($1 ? $0 : '<a href="' + base_url + $3
          + '" title="Follow ' + $3 + '" target="_blank">@' + $3
          + '</a>');
      });
    // convert #hashtags into tag search links
    text = text.replace(
      /(:\/\/[^ <]*|>)?(\#([_a-z0-9\-]+))/gi,
      function($0, $1, $2, $3) {
        return ($1 ? $0 : '<a href="' + base_url + hashtag_part + $3
          + '" title="Search tag: ' + $3 + '" target="_blank">#' + $3
          + '</a>');
      });
    return text;
  };
}
