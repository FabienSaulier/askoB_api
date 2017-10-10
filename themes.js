const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const Themeschema = new mongoose.Schema(
	{
		label: {
			type: String
		},
		text: {
			type: String
		},
	}
);

Themeschema.plugin(timestamps);
Themeschema.plugin(mongooseStringQuery);

const Themes = mongoose.model('themes', Themeschema);
module.exports = Themes;    