
const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const AnswerSchema = new mongoose.Schema(
	{
		label: {
			type: String
		},
		text: {
			type: String
		},
	}
);

AnswerSchema.plugin(timestamps);
AnswerSchema.plugin(mongooseStringQuery);

const Answers = mongoose.model('answers', AnswerSchema);
module.exports = Answers;    