/*
  Fichier     : config/events.js
  Auteur      : Youness FATH
  Date        : 31.10.2017
  Description : Contient les différentes énumrations
*/

// Définition des données exportées
module.exports = {
    // Phrase secrète pour la configuration de Passport
    eventType: [
      //-------------------------------//
      // Gestion des utilisateurs
      //-------------------------------//
      'user_register',
      'user_login', 
      'user_logout', 
      'user_edit', 
      'user_favorite', 
      'user_unfavorite',
      //-------------------------------//
      // Gestion des articles
      //-------------------------------//
      'article_create',
      'article_edit',
      'article_publish',
      'article_delete',
      //-------------------------------//
      // Gestion des appels d'offres
      //-------------------------------//
      'tender_create',
      'tender_edit',
      'tender_publish',
      'tender_cancel',
      'tender_close',
      'tender_delete',
      //-------------------------------//
      // Gestion des reactions
      //-------------------------------//
      'comment',
      'uncomment',
      'like',
      'unlike',
    ] 
  };
  