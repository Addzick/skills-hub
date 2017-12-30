/*
  Fichier     : controllers/addresses.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur de gestion des adresses
*/

// Importation des ressources externes
const mongoose = require('mongoose');
const auth = require('../config/auth');
const Address = mongoose.model('address');
const Tender = mongoose.model('tender');
const User = mongoose.model('user');

// Définition du controleur
class AddressCtrl {

    constructor() {
    }

    get(req, res, next) {
        return Address
        .findById(req.params.address)
        .then(function(addr) {
            if (!addr) { return res.sendStatus(404); }
            return res.status(200).json({ address: addr });
        }).catch(next);
    }

    upsert(req, res, next) {
        return User
        .findById(req.payload.id)
        .then(function(user) {
            if (!user) { return res.sendStatus(401); }
            var address = req.body.address;
            return Address
            .findOneAndUpdate({ 'loc.coordinates': address.loc.coordinates }, address, { new: true, upsert:true })
            .then(function(addr) {
                if(req.body.tender){
                    return Tender
                    .findOneAndUpdate({ _id: req.body.tender }, { $set: { address: addr }})
                    .then(() => {
                        return res.status(200).json({ 
                            address: addr
                        });
                    });
                } else {
                    return User
                    .findOneAndUpdate({ _id: req.payload.id }, { $set: { address: addr }})
                    .then(() => {
                        return res.status(200).json({ 
                            address: addr
                        });
                    });
                }
            });
        }).catch(next);
    }

    delete(req, res, next){
        return User
        .findById(req.payload.id)
        .then(function(user) {
            if (!user) { return res.sendStatus(401); }
            return Address
            .findOneAndRemove({ _id : req.address._id })
            .then(function(addr) {
                if(req.body.tender){
                    return Tender
                    .findOneAndUpdate({ _id: req.body.tender }, { $unset: { address: "" }})
                    .then(() => {
                        return res.sendStatus(202);
                    });
                } else {
                    return User
                    .findOneAndUpdate({ _id: req.payload.id }, { $unset: { address: "" }})
                    .then(() => {
                        return res.sendStatus(202);
                    });
                }
            });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.get('/:address', this.get);
        router.post('/', auth.required, this.upsert);
        router.delete('/:address', auth.required, this.delete);
        return router;
    }
}

module.exports = new AddressCtrl();