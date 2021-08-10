const Joi = require('joi');

const PlaylistsPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistSongsPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PlaylistsPayloadSchema,
  PlaylistSongsPayloadSchema
};
