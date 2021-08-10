const InvariantError = require('../../exceptions/InvariantError');
const { PictureHeadersSchema } = require('./schema');

const UploadsValidator = {
  validatePictureHeaders: (headers) => {
    const validationResult = PictureHeadersSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadsValidator;
