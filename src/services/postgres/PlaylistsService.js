const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationsError = require('../../exceptions/AuthorizationsError');
const { mapDBToModel, mapDBToModelPlaylists, mapDBToModelPlaylistSongs } = require('../../utils');

class PlaylistsService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    console.log(name, owner);

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelPlaylists);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Songs tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editSongById(id, { title, year, performer, genre, duration }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: `UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "updatedAt" = $6 WHERE id = $7 RETURNING id`,
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal update Songs. Id tidak ditemukan');
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Songs gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationsError('Anda tidak berhak mengakses resource ini, karena anda tidak memiliki hak akses!');
    }
  }

  async addPostSongs({ playlistId, songId }) {
    const id = `playlistsongs-${nanoid(16)}`;

    console.log(playlistId, songId);

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3)',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Songs Playlist gagal ditambahkan');
    }

    await this._cacheService.delete(`songsPlaylist:${playlistId}`);
  }

  async getPlaylistSongs(owner) {
    try {
      const result = await this._cacheService.get(`songsPlaylist:${owner}`);
      return JSON.parse(result);
    } catch (error) {
        const query = {
        text: `SELECT S.id, S.title, S.performer
        FROM playlistsongs as PS
        LEFT JOIN songs as S ON S.id = PS.song_id
        LEFT JOIN playlists as P ON P.id = PS.playlist_id
        LEFT JOIN collaborations ON collaborations.playlist_id = P.id
        WHERE P.owner = $1 OR collaborations.user_id = $1`,
        values: [owner],
    };

    const result = await this._pool.query(query);
    const mappedResult = result.rows.map(mapDBToModelPlaylistSongs);

    await this._cacheService.set(`songsPlaylist:${owner}`, JSON.stringify(mappedResult));

    return mappedResult;
  }
}

  async deletePlaylistSongById(playlistid, songId) {
    const query = {
      text:
        'DELETE FROM playlistsongs WHERE playlist_id=$1 and song_id = $2 RETURNING id',
      values: [playlistid, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Songs gagal dihapus. Song Id tidak ditemukan');
    }

    await this._cacheService.delete(`songs:${playlistid}`);
  }

  async verifyAccess(playlistId, userId) {
    try {
      await this._collaborationService.verifyCollaborator(playlistId, userId);
    } catch (error) {
      if (error instanceof InvariantError) {
        throw error;
      }
      try {
        await this.verifyPlaylistOwner(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async verifySongID(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Songs tidak valid');
    }
  }
}

module.exports = PlaylistsService;
