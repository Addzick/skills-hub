/*
  Fichier     : controllers/events.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur de gestion des events
*/

// Importation des ressources externes
const auth = require('../config/auth');
const mongoose = require('mongoose');
const Event = mongoose.model('event');
const User = mongoose.model('user');

// Définition du controleur
class EventCtrl {

    constructor() {
    }

    findAll(req, res, next) {

        var query = {};
        var opts = { skip: 0, limit: 20, sort: { updatedAt: 'desc' } };
        
        if(typeof req.query.types !== 'undefined') {
            query.type = { '$in' : req.query.types };
        }
        if(typeof req.query.source !== 'undefined' ) {
            query['source.item'] = mongoose.Types.ObjectId(req.query.source);
        }
        if(typeof req.query.excludes !== 'undefined') {
            query.type = { '$nin' : req.query.excludes };
        }        
        if(typeof req.query.startDate !== 'undefined' && typeof req.query.endDate !== 'undefined') {
            query.updatedAt = { 
                $gte: new ISODate(req.query.startDate),
                $lte: new ISODate(req.query.endDate)
            }
        }        
        if(typeof req.query.author !== 'undefined' ) {
            query.author = { _id : mongoose.Types.ObjectId(req.query.author) };
        }
        if(typeof req.query.localisation !== 'undefined') {
            query.source.kind = 'tender';
            query.source.item.address.loc = { 
                loc: { 
                    $near : { 
                        $geometry : { 
                            type : "Point" ,
                            coordinates : [ new Number(req.query.localisation.longitude) , new Number(req.localisation.latitude) ] 
                        } ,
                        $maxDistance : new Number(req.query.localisation.distance) || 50
                    } 
                } 
            }
        }                
        if(typeof req.query.sortBy !== 'undefined') {
            opts.sort[req.query.sortBy] = req.query.sortDir || 'asc';
        }
        if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
            opts.limit = Number(req.query.size);
        }
        if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
            opts.skip = Number((req.query.page - 1) * req.query.size);
        }
        
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(),
            Event.find(query, {}, opts).exec(),
            Event.count(query).exec()
        ]).then(function(results){ 
            var user = results[0];
            var events = results[1];
            var nb = results[2];
            
            return res.status(200).json({ 
                events: events.map(function(evt) {
                    return evt.toJSONFor(user);                   
                }),
                count: nb
            });
        }).catch(next);
    }

    findOne(req, res, next) {
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(),
            Event.findOne({ _id: mongoose.Types.ObjectId(req.params.event)}).exec()
        ])
        .then(function(results) {
            if (!results || results.length < 2) { return res.sendStatus(404); }
            return res.status(200).json({
                event : result[1].toJSONFor(result[0])
            });
        })
        .catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.get('/', auth.optional, this.findAll);
        router.get('/:event', auth.optional, this.findOne);
        return router;
    }
}

module.exports = new EventCtrl();