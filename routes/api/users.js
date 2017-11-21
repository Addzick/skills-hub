/*
  Fichier     : routes/api/users.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api de gestion des utilisateurs
*/

// Importation des ressources externes
import Router from 'express';
import UserCtrl from '../../controllers/users';
import auth from '../auth';

// GET : http://<url-site-web:port>/api/account
// Renvoie la liste des utilisateurs recherchés
router.get('/account', new UserCtrl().get);

// POST : http://<url-site-web:port>/api/account
// Modifie le compte de l'utilisateur authentifié
router.post('/account', auth.required, new UserCtrl().edit);

// GET : http://<url-site-web:port>/api/account
// Renvoie la liste des utilisateurs recherchés
router.get('/users', new UserCtrl().findAll);

// GET : http://<url-site-web:port>/api/account
// Renvoie la liste des utilisateurs recherchés
router.get('/users/:username', new UserCtrl().findOne);

// POST : http://<url-site-web:port>/api/login
// Authentifie un utilisateur
router.post('/login', new UserCtrl().login);

// POST : http://<url-site-web:port>/api/register
// Enregistre un nouvel utilisateur
router.post('/register', new UserCtrl().register);

// DELETE : http://<url-site-web:port>/api/logout
// Deconnecte un utilisateur authentifié
router.delete('/logout', new UserCtrl().logout);

// Exportation du routeur
module.exports = router;
