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
      'user_registered',  // 0 => Nouvel utilisateur
      'user_login',       // 1 => Connexion d'un utilisateur
      'user_logout',      // 2 => Déconnexion d'un utilisateur
      'user_edit',        // 3 => Edition d'un utilisateur
      'user_favorite',    // 4 => Ajout d'une catégorie favorie
      'user_unfavorite',  // 5 => Suppression d'une catégorie favorie
      //-------------------------------//
      // Gestion des articles
      //-------------------------------//
      'article_create',   // 6 => Creation d'un article
      'article_edit',     // 7 => Edition d'un article
      'article_publish',  // 8 => Publication d'un article
      'article_delete',   // 9 => Suppression d'un article
      'article_comment',  // 10 => Ajout d'un commentaire d'article
      'article_uncomment',// 11 => Suppression d'un commentaire d'article
      'article_like',     // 12 => Ajout d'un like d'article
      'article_unlike',   // 13 => Suppression d'un like d'article
    ] 
  };
  