/*
  Fichier     : config/index.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient les paramètres de configuration du serveur Node-Express
*/

// Définition des données exportées
module.exports = {
  // Phrase secrète pour la configuration de Passport
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  dbUri: process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : 'mongodb://localhost/skills-hub',
  dbUser: process.env.NODE_ENV === 'production' ? process.env.MONGODB_USER : 'admin',
  dbPwd: process.env.NODE_ENV === 'production' ? process.env.MONGODB_PWD : 'Supertango74*'
};
