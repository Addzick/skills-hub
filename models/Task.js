/*
  Fichier     : models/Task.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une tâche
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'une tâche
var TaskSchema =  new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    amount: Number,
    completionDate: Date,
    completionTime: Number,
    timeUnit:{ type: String, enum: ["ss","mm", "hh", "dd"] },
    onSite: Boolean,
    materialIsSupplied: Boolean,    
    // References
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    concern:{ type: mongoose.SchemaTypes.ObjectId, ref: "tender" },    
    // Timestamps
    publishedAt: Date,
    confirmedAt: Date,
    paidAt: Date,
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
TaskSchema.post('findOne', function(doc,next) { doc.autoload(); next(); });
TaskSchema.post('find', function(docs,next) { 
  for(i=0; i < docs.length; i++) {
    docs[i].autoload();
  }
  next(); 
});

// Définition du traitement de population
TaskSchema.methods.autoload = function() {
  this
  .populate('author')
  .populate('concern');
};

// Attribution du schéma au modèle de tâche
module.exports = mongoose.model('task', TaskSchema);
