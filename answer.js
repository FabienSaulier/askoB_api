
const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

/*
const SonSchema = new mongoose.Schema(
	{
		name: {
			type:String,
			required: true,
			minlength: [1, 'Le nom et le code ne peuvent pas être vide']
		},
		 code: {
			type:String,
			required: true,
			minlength: [1, 'Le nom et le code ne peuvent pas être vide']
		}
	}
);
*/

const AnswerSchema = new mongoose.Schema(
	{
	  code: {
			type: String,
			required: [true, "Un code est nécessaire"],
			unique: [true, "Le code est déjà utilisé"]
		},
		name: {
			type: String,
			required: [true, "Un nom est nécessaire"]
		},
	  text: {
			type: String,
			required: [true, "Le texte de la réponse ne doit pas être vide"]
		},
		deleted:{
			type: Boolean
		},
	  sonsCode: {
			type: [String]
		}
	}
);

AnswerSchema.plugin(timestamps);
AnswerSchema.plugin(mongooseStringQuery);

const Answers = mongoose.model('answers', AnswerSchema);
module.exports = Answers;
