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
    target: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    source: { type: mongoose.SchemaTypes.ObjectId, ref: "Event" },
    //Timestamps
    sentAt: Date,
    readAt:  Date
}, { timestamps: true });

// Définition de la méthode d'envoi
NotificationSchema.methods.send = function(){
    if(!this.sentAt) {
        this.rejectedAt = Date.now;
    }
    return this.save();
};

// Définition de la méthode de lecture
NotificationSchema.methods.read = function(){
    if(!this.readAt) {
        this.readAt = Date.now;
    }
    return this.save();
};

// Attribution du schéma au modèle de notification
module.exports = mongoose.model('Notification', NotificationSchema);
