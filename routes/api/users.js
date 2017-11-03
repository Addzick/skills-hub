/*
  Fichier     : routes/api/users.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api de gestion des utilisateurs
*/

// Importation des ressources externes
var router = require('express').Router();

// Récupération de l'objet de traitement de l'authentification
var auth = require('../auth');

// Récupération des controllers
var controller      = require('../../controllers/users');

// On précharge la catégorie si elle est en paramètre
router.param('category', controller.preloadCategory);

// POST : http://<url-site-web:port>/api/login
// Authentifie un utilisateur
router.post('/login', controller.login);

// DELETE : http://<url-site-web:port>/api/logout
// Deconnecte un utilisateur authentifié
router.delete('/:username', controller.logout);

// POST : http://<url-site-web:port>/api/register
// Enregistre un nouvel utilisateur
router.post('/register', controller.register);

// GET : http://<url-site-web:port>/api/account
// Renvoie le compte de l'utilisateur authentifié
router.get('/account', auth.required, controller.getById);

// PUT : http://<url-site-web:port>/api/account
// Modifie le compte de l'utilisateur authentifié
router.put('/account', auth.required, controller.edit);

// POST : http://<url-site-web:port>/api/account/favorite/:category
// Ajoute une nouvelle categorie favorie
router.post('/account/:category', controller.favorite);

// DELETE : http://<url-site-web:port>/api/account/favorite/:category
// Supprime une categorie favorie
router.delete('/account/:category', controller.unfavorite);

// Exportation du routeur
module.exports = router;
