'use strict';

var app = app || {};

(function(module) {

  const artists = {};

  artists.getArtists = function() {
    $.ajax({
      type : 'GET',
      url : 'http://ws.audioscrobbler.com/2.0/',
      data : 'method=artist.gettoptracks&' +
      'artist=The+Beatles&' +
      'api_key=57ee3318536b23ee81d6b27e36997cde&' +
      'format=json',
      dataType : 'jsonp',
      success : function(data) {
        console.log(data);
      },
      error : function(code, message){
        $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
      }
    });
  };

  module.artists = artists;
})(app);
