const routes = (handler) => [
    {
      method: 'POST',
      path: '/exports/playlists/{playlistId}',
      handler: handler.postExportSongsHandler,
      options: {
        auth: 'openmusicapi_jwt',
      },
    },
  ];

module.exports = routes;
