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

// Récupération du controller
var controller = require('../../controllers/users');

// POST : http://<url-site-web:port>/api/login
// Authentifie un utilisateur
router.post('/login', controller.login);

// POST : http://<url-site-web:port>/api/register
// Enregistre un nouvel utilisateur
router.post('/register', controller.register);

// GET : http://<url-site-web:port>/api/account
// Renvoie le compte de l'utilisateur authentifié
router.get('/account', auth.required, controller.getById);

// POST : http://<url-site-web:port>/api/account/favorite/:category
// Ajoute une nouvelle categorie favorie
router.post('/favorite/:id', controller.favorite);

// DELETE : http://<url-site-web:port>/api/account/favorite/:category
// Supprime une categorie favorie
router.delete('/favorite/:id', controller.unfavorite);

// Exportation du routeur
module.exports = router;
