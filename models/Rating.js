/*
  Fichier     : models/Rating.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une note
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'une note
var RatingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: String, 
    value: { type: Number, min:0, max:5, required: true},
    // References
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    target: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    concern:{ type: mongoose.SchemaTypes.ObjectId, ref: "task" },
    comments:[{ type: mongoose.SchemaTypes.ObjectId, ref: "comment" }],
    likes:[{ type: mongoose.SchemaTypes.ObjectId, ref: "like" }],
    nbComments: Number,
    nbLikes: Number,
    // Timestamps
    publishedAt: Date,    
}, {
  timestamps: true,
  toObject: {
    transform: function(doc, ret){
      delete ret.__v;
    }
  },
  toJSON: {
    transform: function(doc, ret){
      delete ret.__v;
    }
  }
});

// Définition des hooks
RatingSchema.post('findOne', function(doc,next) { doc.autoload(); next(); });
RatingSchema.post('find', function(docs,next) { 
  for(i=0; i < docs.length; i++) {
    docs[i].autoload();
  }
  next(); 
});

// Définition du traitement de population
RatingSchema.methods.autoload = function() {
  this
  .populate('author')
  .populate('target')
  .populate('concern');
};

// Attribution du schéma au modèle de note
module.exports = mongoose.model('rating', RatingSchema);
