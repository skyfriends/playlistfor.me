'use strict';

var app = app || {};
let similarArtists = [];
let topTracks = [];
let allSimilarTracks =[];
let playlistSizeSlider = 3;
let similaritySlider = 1;
let playlist = [];
let appendToPlaylist;

let trackMbid = [];
let albumMbid = [];
let albumCover = [];

(function(module) {

  const artists = {};

  artists.handleButton = function() {
    $('#generate-button').on('click', function(){
      let artistSub = $('#artist-input').val();
      app.artists.getTopTracks(artistSub);
      console.log(artistSub);
    });
  };

  artists.handleSimilaritySlider = function(){
    $('#similarity-slider').on('change', function(){
      similaritySlider = $('#similarity-slider').val();
      console.log(similaritySlider);
    });
  };

  artists.handlePlaylistSizeSlider = function(){
    $('#size-slider').on('change', function(){
      playlistSizeSlider = $('#size-slider').val();
      console.log(playlistSizeSlider);
    });
  };

  artists.handleSimilaritySlider = function(){
    $('#similarity-slider').on('change', function(){
      similaritySlider = $('#similarity-slider').val();
    });
  };

  artists.handlePlaylistSizeSlider = function(){
    $('#size-slider').on('change', function(){
      playlistSizeSlider = $('#size-slider').val();
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
        }));
      }
      return Promise.all(similarArtistsRequests);
    })
    .then(function(data) {

      let similarTracksRequests = [];

      for (var i=0; i< similarArtists.length; i++) {
        let random = Math.floor(Math.random()* 50);
        let simTrack = topTracks[i].track[random];



        similarTracksRequests.push($.ajax({
          type : 'GET',
          url : 'http://ws.audioscrobbler.com/2.0/',
          data : {method: 'track.getsimilar', mbid: simTrack.mbid, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'json'},
          dataType : 'json',
          success: function(data) {
            allSimilarTracks.push(data.similartracks.track);
          }
        }));
      }
      return Promise.all(similarTracksRequests);
    })
    .then(function(data){

      let albumArtRequests = [];

      playlist = allSimilarTracks.concat.apply([], allSimilarTracks);
      for (var i=0; i<playlistSizeSlider; i++){
        trackMbid.push(playlist[i].mbid);
        albumArtRequests.push($.ajax({
          type : 'GET',
          url : 'http://ws.audioscrobbler.com/2.0/',
          data : {method: 'track.getinfo', mbid: `${trackMbid[i]}`, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'json'},
          dataType : 'json',
          success: function(data) {

            albumMbid.push(data.track.album.mbid);
            $.ajax({
              type: 'GET',
              data: {format: 'json'},
              url: `http://coverartarchive.org/release/${albumMbid[]}`,
              ///////ITS PROBABLY SOMETHING TO DO WITH THIS///////
              dataType: 'json',
              success: function(data){
                albumCover.push(data.images[0].image);

              }
            });
          }
        }));
      }
      return Promise.all(albumArtRequests);
    })
    .then(function(data){
      for (var i=similaritySlider; i<(similaritySlider + playlistSizeSlider); i++){
        let content = {trackName: playlist[i].name, artistName: playlist[i].artist.name, albumArt: albumCover, albumName: '', duration: playlist[i].duration};
        var template = Handlebars.compile($('#trackTemplate').text())(content);
        console.log(playlist);
        console.log(template);
        $('#tracks').append(template);
      }

    })
  };
  module.artists = artists;
})(app);
