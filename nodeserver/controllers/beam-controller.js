const uuid = require('uuid').v4;

// Use object de-structuring
const { validationResult } = require('express-validator');
const Hyperbeam = require('hyperbeam')
var beam = new Hyperbeam()

const { count } = require('console');
const e = require('cors');
// CRUD operations

const getKey = async (req, res, next) => { 
    
    if (beam.key) {
        // Return id getter from _id property
        res.json({key: beam.key});
    }
    else {
        res.status(500).json(
            {
                message:'A critical error occurred, no hyperbeam key was found, please try again later.'
            }
        )
    }
}

const connect = async (req, res, next) => {
    let key = req.body.key;
    if (key == beam.key) {
        res.json({message: "Hyper beam is already connected to key"});
    }
    else {
        beam = new Hyperbeam(key);
        if (beam.key == key) {
            
            res.json({message: "Hyper beam successfully connected to new key: " + beam.key});
        }
        else {
            res.status(500).json(
                {
                    message: 'A critical error occurred, hyperbeam failed to connect, please try again later.' + key
                }
            )
        }
    }
}



module.exports = {getKey, connect };