/*
  Fichier     : socket.js
  Auteur      : Youness FATH
  Date        : 27.11.2017
  Description : Script de configuration du serveur de socket
*/

// Importation des ressources externes
const userCtrl = require('./controllers/users');
const Event = require('./models/Event');

// Définition du traitement d'initialisation
module.exports.initialization = function(server) {
    
    // Création du serveur de socket
    var io = require('socket.io').listen(server);
    
    // Définition des méthodes attribuées au socket
    io.sockets.on('connection', function(socket) {
      // Set socket ID
      socket.on('set socket', function(username) {
        userCtrl.setSocketId(username, socket.id);
      });
    
      // Unset socket ID
      socket.on('unset socket', function(username) {
        userCtrl.unsetSocketId(username);
      });
    });
    
    // On met en place un broadcast sur chaque nouvel evenement
    Event.on('new', function(newEvent, next) {  
      // On renvoie l'evenement avec ces sous-documents
      Event
      .findOne({ _id: newEvent._id})
      .then(function(event) { io.sockets.emit('new event', event); })
      .catch(next);
    });
}
