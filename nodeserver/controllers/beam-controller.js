const uuid = require('uuid').v4;

// Use object de-structuring
const b64 = require('b64');
const Hyperswarm = require('hyperswarm')
const swarm = new Hyperswarm()
// CRUD operations

swarm.on('connection', (conn, info) => {
    // swarm1 will receive server connections
    conn.write('Successful connection to peer: ' + info.publicKey);
    conn.end();
});


const getKey = async (req, res, next) => { 
    
    if (swarm.keyPair) {
        // Return id getter from _id property
        res.json({key: swarm.keyPair});
    }
    else {
        res.status(500).json(
            {
                message:'A critical error occurred, no hypercore key was found, please try again later.'
            }
        )
    }
}

const connect = async (req, res, next) => {
    let key = String(req.body.key);
    if (key == beam.key) {
        res.json({message: "Hyper core is already connected to key"});
    }
    else {
        swarm.joinPeer(key);
        res.json({message: "Hyper core successfully connected to new key: " + beam.key});

       
    }
}
function encode(data)  {
    let uEnv = b64.base64urlEncode(data);
    return String(uEnv)
}

const push = async (req, res, next) => {
    let data = encode(String(req.body.data));
    swarm.write(data);
    res.json({base64String: data});
}



module.exports = {getKey, connect, push};