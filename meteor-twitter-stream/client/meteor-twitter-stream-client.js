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

  Template.twitter.rendered = function () {
    ! function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (!d.getElementById(id)) {
        js = d.createElement(s);
        js.id = id;
        js.src = "//platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, "script", "twitter-wjs");
  }
}