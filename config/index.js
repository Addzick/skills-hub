/*
  Fichier     : config/index.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient les paramètres de configuration du serveur Node-Express
*/

// Définition des données exportées
module.exports = {
  // Phrase secrète pour la configuration de Passport
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret'
};
