/*
  Fichier     : models/Notification.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une notification
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'une notification
var NotificationSchema =  new mongoose.Schema({
    // References
    target: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    source: { type: mongoose.SchemaTypes.ObjectId, ref: "event" },
    //Timestamps
    sentAt: Date,
    readAt:  Date
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
NotificationSchema.post('findOne', function(doc,next) { doc.autoload(); next(); });
NotificationSchema.post('find', function(docs,next) { 
  for(i=0; i < docs.length; i++) {
    docs[i].autoload();
  }
  next(); 
});

// Définition du traitement de population
NotificationSchema.methods.autoload = function() {
  this
  .populate('target')
  .populate('source');
};

// Attribution du schéma au modèle de notification
module.exports = mongoose.model('notification', NotificationSchema);
