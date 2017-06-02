'use strict';

var app = app || {};
let similarArtists = [];
let topTracks = [];
let allSimilarTracks =[];
let playlistSizeSlider = 1;
let similaritySlider = 1;
let playlist = [];
let appendToPlaylist;
let realTracks = [];
let trackMbid = [];
let albumMbid = [];
let albumCovers = [];
let trackCount;

(function(module) {

  const artists = {};

  function shufflePlaylist(playlist) {
    let seen = {};
    return _.shuffle(playlist.filter(function(song) {
      if (seen[song.mbid]) {
        return false;
      } else {
        seen[song.mbid] = true;
        return true;
      }
    }))
  };

  artists.handleButton = function() {
    $('#tracks').hide();
    $('#generate-button').on('click', function(){
      let artistSub = $('#artist-input').val();
      app.artists.getTopTracks(artistSub);
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
      url : 'https://ws.audioscrobbler.com/2.0/',
      data : {method: 'artist.getinfo', artist: artistSub, api_key: fmKey, format: 'json'},
      dataType: 'json',

    }).then(function(data){

      let $artistList = $('<ul>').addClass('artistList').appendTo('#artist');
      let similarArtistsRequests = [];

      for (var i=0; i<data.artist.similar.artist.length; i++){
        similarArtists.push(data.artist.similar.artist[i].name);
        // $(`<li>${similarArtists[i]}</li>`).appendTo($artistList);
        let listOfArtists = data.artist.similar.artist[i].name;
        similarArtistsRequests.push($.ajax({
          type : 'GET',
          url : 'https://ws.audioscrobbler.com/2.0/',
          data : {method: 'artist.gettoptracks', artist: listOfArtists, api_key: fmKey, format: 'json'},
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
        let simTrack = topTracks[i].track[i];



        similarTracksRequests.push($.ajax({
          type : 'GET',
          url : 'https://ws.audioscrobbler.com/2.0/',
          data : {method: 'track.getsimilar', mbid: simTrack.mbid, api_key: fmKey, format: 'json'},
          dataType : 'json',
          success: function(data) {
            if (data.similartracks) {
              allSimilarTracks.push(data.similartracks.track);
            }
          }
        }));
      }
      return Promise.all(similarTracksRequests);
    })
    .then(function(data){
      let albumArtRequests = [];
      playlist = allSimilarTracks.concat.apply([], allSimilarTracks);
      // playlist = shufflePlaylist(playlist);
      for (var i=0; i<playlistSizeSlider; i++){
        trackMbid.push(playlist[i].mbid);
        albumArtRequests.push($.ajax({
          type : 'GET',
          url : 'https://ws.audioscrobbler.com/2.0/',
          data : {method: 'track.getinfo', mbid: `${trackMbid[i]}`, api_key: fmKey, format: 'json'},
          dataType : 'json',
          success: function(data) {
            albumMbid.push(data.track.album.mbid);
            realTracks.push(data);
          },
          error: function(error) {
          }
        }));
      }
      return Promise.all(albumArtRequests);
    })
    .then(function(data){
      let albumArtRequests = [];
      for (var i=0; i< playlistSizeSlider; i++){
        albumArtRequests.push($.ajax({
          type: 'GET',
          data: {format: 'json', method: 'album.getinfo', mbid: albumMbid[i], api_key: fmKey},
          url: 'https://ws.audioscrobbler.com/2.0/',
          dataType: 'json',
          success: function(data){
            albumCovers.push(data.album.image[3]['#text']);
          },
          error: function(){
            albumCovers.push('../images/defaultAlbum.png');

          }
        }));
      }
      return Promise.all(albumArtRequests);
    }).then(function() {
      function convert(duration) {
        let m = Math.floor(duration / 60);
        let s = duration % 60;
        s = s < 10 ? '0' + s : s;
        return m + ':' + s;
      }
      let testCount =  playlistSizeSlider;
      for (var j=0; j<(testCount); j++){
        let content = {trackName: realTracks[j].track.name, artistName: realTracks[j].track.artist.name, albumArt: realTracks[j].track.album.image[3]['#text'], albumName: '', duration: convert(playlist[j].duration)};
        var template = Handlebars.compile($('#trackTemplate').html())(content);
        $('#tracks').append(template);
        $('main').hide()
        $('#tracks').fadeIn();

      }
    });
  };
  module.artists = artists;
})(app);
