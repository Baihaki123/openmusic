class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postPlaylistSonghandler = this.postPlaylistSonghandler.bind(this);
    this.getPlaylistSongshandler = this.getPlaylistSongshandler.bind(this);
    this.deletePlaylistSongBySongIdHandler = this.deletePlaylistSongBySongIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
      this._validator.validatePlaylistsPayload(request.payload);

      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({ name, owner: credentialId, });

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
  }

  async getPlaylistsHandler(request) {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);
      return {
        status: 'success',
        data: {
          playlists,
        },
      };
  }

  async deletePlaylistByIdHandler(request) {
      const { playlistid } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistid, credentialId);
      await this._service.deletePlaylistById(playlistid);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
  }

  async postPlaylistSonghandler(request, h) {
      this._validator.validatePostPlaylistSongsPayload(request.payload);

      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyAccess(playlistId, credentialId);
      await this._service.verifySongID(songId);
      await this._service.addPostSongs({ playlistId, songId, });

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      });

      response.code(201);
      return response;
  }

  async getPlaylistSongshandler(request) {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyAccess(playlistId, credentialId);
      const songs = await this._service.getPlaylistSongs(credentialId);

      return {
        status: 'success',
        data: {
          songs,
        },
      };
  }

  async deletePlaylistSongBySongIdHandler(request) {
      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyAccess(playlistId, credentialId);
      await this._service.deletePlaylistSongById(playlistId, songId);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
  }
}

module.exports = PlaylistsHandler;
