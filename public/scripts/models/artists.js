'use strict';

var app = app || {};
let similarArtists = [];
let topTracks = [];

(function(module) {

  const artists = {};

  artists.handleButton = function() {
    $('#artist-button').on('click', function(){
      let artistSub = $('#artist-input').val();
      app.artists.getTopTracks(artistSub);
    });
  };






  artists.getTopTracks = function(artistSub) {
    $.ajax({
      type : 'GET',
      url : 'http://ws.audioscrobbler.com/2.0/',
      data : {method: 'artist.getInfo', artists: artistSub, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'jsonp'},
      dataType : 'jsonp',
      success : function(data) {
        let $artistList = $('<ul>').addClass('artistList').appendTo('#artist');

        for (var i=0; i<data.artist.similar.artist.length; i++){
          similarArtists.push(data.artist.similar.artist[i].name);
          $(`<li>${similarArtists[i]}</li>`).appendTo($artistList);

          $.ajax({
            type : 'GET',
            url : 'http://ws.audioscrobbler.com/2.0/',
            data : {method: 'artist.getTopTracks', artist: artistSub, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'jsonp'},
            dataType : 'jsonp',
            success : function(data) {
              // console.log(data.toptracks);
              topTracks.push(data.toptracks);
            },
            error : function(code, message){
              $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
            }
          });
        }

      }

    }).then(function(){
      app.artists.getSimilarTracks();
    });
    // console.log(topTracks);
    // console.log(similarArtists);
  };

  artists.getSimilarTracks = function() {
    for (var i=0; i< similarArtists.length; i++) {

      let artist = similarArtists[i];
      console.log(artist);

      let track = topTracks[i];
      console.log(track);

    }
  //   $.ajax({
  //     type : 'GET',
  //     url : 'http://ws.audioscrobbler.com/2.0/',
  //     data : 'method=track.getSimilar&' +
  //     'api_key=57ee3318536b23ee81d6b27e36997cde&' +
  //     'format=json',
  //     dataType : 'jsonp',
  //     success : function(data) {
  //       console.log(data);
  //     },
  //     error : function(code, message){
  //       $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
  //     }
  //   });
  };

  module.artists = artists;
})(app);
