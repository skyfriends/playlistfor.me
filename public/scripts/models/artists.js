'use strict';

var app = app || {};
let similarArtists = [];
let topTracks = [];
let allSimilarTracks =[];
let similaritySlider = 1;
let playlistSizeSlider = 3;
let playlist = [];
let ajaxCalled=0;
let post = 0;
let trackMbid = [];
let albumMbid = [];
let albumCovers = [];

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
  }

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
      url : 'https://ws.audioscrobbler.com/2.0/',
      data : {method: 'artist.getinfo', artist: artistSub, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'json'},
      dataType: 'json',

    }).then(function(data){
      playlist = [];
      let $artistList = $('<ul>').addClass('artistList').appendTo('#artist');
      let similarArtistsRequests = [];
      for (var i=0; i<data.artist.similar.artist.length; i++){
        similarArtists.push(data.artist.similar.artist[i].name);
        $artistList.push(similarArtists);
        let listOfArtists = data.artist.similar.artist[i].name;
        similarArtistsRequests.push($.ajax({
          type : 'GET',
          url : 'https://ws.audioscrobbler.com/2.0/',
          data : {method: 'artist.gettoptracks', artist: listOfArtists, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'json'},
          dataType : 'json',
          success: function(data) {
            topTracks.push(data.toptracks);
            ajaxCalled++;
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
          url : 'https://ws.audioscrobbler.com/2.0/',
          data : {method: 'track.getsimilar', mbid: simTrack.mbid, api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'json'},
          dataType : 'json',
          success: function(data) {
            if (data.similartracks) {
              console.log(data);
              ajaxCalled++;
              allSimilarTracks.push(data.similartracks.track);
            }
          }
        }));
      }
      return Promise.all(similarTracksRequests);
    })
    .then(function(data){

      let albumArtRequests = [];
      let l = 0;
      playlist = allSimilarTracks.concat.apply([], allSimilarTracks);
      playlist = shufflePlaylist(playlist);
      for (var i=similaritySlider; i<(similaritySlider + playlistSizeSlider); i++){
        trackMbid.push(playlist[i].mbid);
        albumArtRequests.push($.ajax({
          type : 'GET',
          url : 'https://ws.audioscrobbler.com/2.0/',
          data : {method: 'track.getinfo', mbid: trackMbid[l], api_key: '57ee3318536b23ee81d6b27e36997cde', format: 'json'},
          dataType : 'json',
          success: function(data) {
            albumMbid.push(data.track.album.mbid);
            ajaxCalled++;
            l++;
            
          },
          error: function(error) {
            console.log(error);
          }
        }));
      }
      return Promise.all(albumArtRequests);
    })
    .then(function(data){
      let albumArtRequests = [];
      for (var i=0; i<(playlistSizeSlider); i++){
        albumArtRequests.push($.ajax({
          type: 'GET',
          data: {format: 'json', method: 'album.getinfo', mbid: albumMbid[i], api_key: '57ee3318536b23ee81d6b27e36997cde'},
          url: `https://ws.audioscrobbler.com/2.0/`,
          dataType: 'json',
          success: function(data){
            console.log(data);
            albumCovers.push(data.album.image[3]['#text']);
            ajaxCalled++;

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
      let k = 0;
      let j = similaritySlider+playlistSizeSlider;
      for (var h=(similaritySlider); h<j; h++){
        let content = {trackName: playlist[h].name, artistName: playlist[h].artist.name, albumArt: albumCovers[k], albumName: '', duration: convert(playlist[h].duration)};
        var template = Handlebars.compile($('#trackTemplate').html())(content);
        console.log(h);
        console.log(k);
        console.log(playlist);
        console.log(template);
        $('#tracks').append(template);
        post++;
        k++;
      }
    });
  };
  module.artists = artists;
})(app);
