const NewsLetter = require('../../models/newsLetterModel');
const factory = require('../../controllers/v1/handlerFactory');

exports.createNewsLetter = factory.createOne(NewsLetter);

exports.getAllNewsLetters = factory.getAll(NewsLetter);
