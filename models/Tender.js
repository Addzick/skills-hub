/*
  Fichier     : models/Tender.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à un appel d'offres
*/

// Importation des ressources externes
var mongoose = require('mongoose');
var Event = require('./Event');
var User = require('./User');

// Définition du schéma d'un appel d'offres
var TenderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,    
    medias: [String],
    isPrivate: Boolean,
    canAcceptPrivateProps: Boolean,
    workDate: Date,
    validityStart: Date,
    validityEnd: Date,
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    address: { type: mongoose.SchemaTypes.ObjectId, ref: 'address' },
    target: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    category:{ type: mongoose.SchemaTypes.ObjectId, ref: "category" },    
    comments:[{ type: mongoose.SchemaTypes.ObjectId, ref: "comment" }],
    likes:[{ type: mongoose.SchemaTypes.ObjectId, ref: "like" }],
    propositions:[{ type: mongoose.SchemaTypes.ObjectId, ref: "proposition" }],
    tasks:[{ type: mongoose.SchemaTypes.ObjectId, ref: "task" }],
    nbComments: Number,
    nbLikes: Number,
    nbPropositions: Number,
    nbTasks: Number,
    // Timestamps
    publishedAt: Date,
    closedAt: Date,
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
TenderSchema.post('findOne', function(doc,next) { doc.autoload(); next(); });
TenderSchema.post('find', function(docs,next) { 
  for(i=0; i < docs.length; i++) {
    docs[i].autoload();
  }
  next(); 
});

// Définition du traitement de population
TenderSchema.methods.autoload = function() {
    this
    .populate('address')
    .populate('author')
    .populate('target')
    .populate('category');
};

// Attribution du schéma au modèle d'appel d'offres
module.exports = mongoose.model('tender', TenderSchema);
