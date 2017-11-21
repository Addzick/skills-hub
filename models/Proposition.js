/*
  Fichier     : models/Proposition.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une proposition
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'une proposition
var PropositionSchema =  new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    amount: Number,
    isPrivate: Boolean,
    estimedTime: Number,
    timeUnit: { type: String, enum: ["ss","mm", "hh", "dd"]},
    workDate: Date,
    validityStart: Date,
    validityEnd: Date,    
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    source: { type: mongoose.SchemaTypes.ObjectId, ref: "tender" },   
    comments: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'comment' }],
    likes: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'like' }],
    nbComments: Number,
    nbLikes: Number,
    publishedAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    canceledAt: Date,
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
PropositionSchema
.pre('findOne', autoload)
.pre('find', autoload);

// Définition du traitement de population
PropositionSchema.methods.autoload = function(next) {
  this.populate('author').populate('source');
  next();
};

// Attribution du schéma au modèle de proposition
module.exports = mongoose.model('proposition', PropositionSchema);
