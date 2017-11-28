import mongoose from 'mongoose'
import mongooseStringQuery from 'mongoose-string-query'
import timestamps from 'mongoose-timestamp'
import uniqueValidator from 'mongoose-unique-validator'

const SubAnswerSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		 label: { // le label affiché en cas de quick_reply
			type: String,
			required: true
		}
	}
);

const AnswerSchema = new mongoose.Schema(
	{
	  name: {
			type: String,
			required: [true, "Un name est nécessaire"],
		},
		description: { // description utilise en interne
			type: String,
			required: [true, "Une description est nécessaire"],
		},
		species: {
			type: String,
			required: [true, "Une species est nécessaire"],
		},
		intent: {
			type: String,
			required: [true, "Une intent est nécessaire"],
		},
		entities: {
			type: [String],
		},
	  text: {
			type: String,
			required: [true, "Le texte de la réponse ne doit pas être vide"],
		},
		children: {
			type: [SubAnswerSchema],
		},
		siblings: {
			type: [SubAnswerSchema],
		},
		is_deleted:{
			type: Boolean,
			default: false,
		},
	}
);

AnswerSchema.plugin(timestamps);
AnswerSchema.plugin(mongooseStringQuery);
AnswerSchema.plugin(uniqueValidator); // for name but buggy when update

const Answers = mongoose.model('answers', AnswerSchema);
module.exports = Answers;
