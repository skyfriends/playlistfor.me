
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
      data : {method: 'artist.getinfo', artist: artistSub, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'json'},
      dataType: 'json',

    }).then(function(data){

      let $artistList = $('<ul>').addClass('artistList').appendTo('#artist');
      let similarArtistsRequests = [];

      for (var i=0; i<data.artist.similar.artist.length; i++){
        similarArtists.push(data.artist.similar.artist[i].name);
        $(`<li>${similarArtists[i]}</li>`).appendTo($artistList);
        let listOfArtists = data.artist.similar.artist[i].name;
        similarArtistsRequests.push($.ajax({
          type : 'GET',
          url : 'http://ws.audioscrobbler.com/2.0/',
          data : {method: 'artist.gettoptracks', artist: listOfArtists, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'json'},
          dataType : 'json',
          success: function(data) {
            topTracks.push(data.toptracks);
          }
        }))
      }
      return Promise.all(similarArtistsRequests)
    })
    .then(function(data) {

        for (var i=0; i< similarArtists.length; i++) {
          let random = Math.floor(Math.random()* 50);
          let simArtist = topTracks[i].track[random].artist.name;
          let simTrack = topTracks[i].track[random];
          console.log(simArtist)
          console.log(simTrack)
          console.log(random)

            $.ajax({
            type : 'GET',
            url : 'http://ws.audioscrobbler.com/2.0/',
            data : {method: 'track.getsimilar', track: simTrack, artist: simArtist, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'json'},
            dataType : 'json',
            success: function(data) {
              //  console.log(data.artist);
              //  console.log(data.track)
            }
          })

        }
  });
}
  module.artists = artists;
})(app);
