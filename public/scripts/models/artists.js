'use strict';

var app = app || {};
let similarArtists = [];
let topTracks = [];
let allSimilarTracks =[];
let playlistSizeSlider = 3;
let similaritySlider = 1;
let playlist = [];
let appendToPlaylist;

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
            console.log(data);
            allSimilarTracks.push(data.similartracks.track);
          }
        }));
      }
      return Promise.all(similarTracksRequests);
    })
    .then(function(data){
      playlist = allSimilarTracks.concat.apply([], allSimilarTracks);
      for (var i=similaritySlider; i<(similaritySlider + playlistSizeSlider); i++){
        // appendToPlaylist = playlist[i].name;
        // let context = {title: playlist[i].name, body: "This is my first post!"};
        // let source   = $("#trackTemplate").html();
        // let template = Handlebars.compile(source);
        // appendToPlaylist = template(context);
        let content = {trackName: playlist[i].name, artistName: playlist[i].artist.name, albumName: '', duration: playlist[i].duration}
        var template = Handlebars.compile($('#trackTemplate').text())(content);
        console.log(playlist);
        console.log(template);
        $('#tracks').append(template);
      }
    });
  };
  module.artists = artists;
})(app);