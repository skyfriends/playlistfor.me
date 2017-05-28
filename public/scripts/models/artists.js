'use strict';

var app = app || {};

(function(module) {

  const artists = {};

  artists.handleButton = function() {
    $('#artist-button').on('click', function(){
      let artistSub = $('#artist-input').val();
      console.log(artistSub);
      app.artists.getArtists(artistSub);
    });
  };

  artists.getArtists = function(artistSub) {
    $.ajax({
      type : 'GET',
      url : 'http://ws.audioscrobbler.com/2.0/',
      data : 'method=artist.getinfo&' +
      `artist=${artistSub}&` +
      'api_key=57ee3318536b23ee81d6b27e36997cde&' +
      'format=json',
      dataType : 'jsonp',
      success : function(data) {
        let $artistList = $('<ul>').addClass('artistList').appendTo('#artist');

        let similarArtists = [];
        console.log(data.artist.similar.artist);
        for (var i=0; i<data.artist.similar.artist.length; i++){
          similarArtists.push(data.artist.similar.artist[i].name);
          $(`<li>${similarArtists[i]}</li>`).appendTo($artistList);
        }
      },
      error : function(code, message){
        $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
      }
    });
  };

  module.artists = artists;
})(app);
