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
NotificationSchema.pre('findOne', function(next) { 
  this
  .populate('target')
  .populate('source');
  next(); 
});

NotificationSchema.pre('find', function(next) { 
  this
  .populate('target')
  .populate('source');
  next();
});

// Attribution du schéma au modèle de notification
module.exports = mongoose.model('notification', NotificationSchema);
