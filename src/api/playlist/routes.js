const routes = (handler) => [
    {
      method: 'POST',
      path: '/playlists',
      handler: handler.postPlaylistHandler,
      options: {
        auth: 'openmusicapi_jwt',
      },
    },
    {
      method: 'GET',
      path: '/playlists',
      handler: handler.getPlaylistsHandler,
      options: {
        auth: 'openmusicapi_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/playlists/{playlistid}',
      handler: handler.deletePlaylistByIdHandler,
      options: {
        auth: 'openmusicapi_jwt',
      },
    },
    {
      method: 'POST',
      path: '/playlists/{playlistId}/songs',
      handler: handler.postPlaylistSonghandler,
      options: {
        auth: 'openmusicapi_jwt',
      },
    },
    {
      method: 'GET',
      path: '/playlists/{playlistId}/songs',
      handler: handler.getPlaylistSongshandler,
      options: {
        auth: 'openmusicapi_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/playlists/{playlistId}/songs',
      handler: handler.deletePlaylistSongBySongIdHandler,
      options: {
        auth: 'openmusicapi_jwt',
      },
    },
  ];

  module.exports = routes;
