// Use object de-structuring
const b64 = require('b64');
const hyperswarm = require('hyperswarm')
const request = require('request');
const { exec } = require("child_process");
const crypto = require('crypto')


var currentHash = "sha256";
var currentFill = "PENISLOVER";
var topic = crypto.createHash(currentHash)
  .update(currentFill)
  .digest()

const swarm = new hyperswarm();



// CRUD operations
swarm.join(topic);

swarm.on('connection', (conn, info) => {
    // swarm will receive server connections

    process.stdin.pipe(conn).pipe(process.stdout);

    conn.on('data', data => console.log('Connection:', decode(data.toString())))
});
swarm.on('disconnection', (conn, details) => {
    console.log(details.peer.host, 'disconnected!')
    console.log('now we have', swarm.peers.length, 'peers!')
  })
const lambda = async (req, res, next) => {

    exec("docker run node:alpine", (error, stdout, stderr) => {
        if (error) {
            return res.status(400).json({ error: error.message});
           
        }
        if (stderr) {
            return res.status(400).json({ stderr: stderr});
        }
        return res.json({ message: stdout});
    });

}

const executeCodeRequest = async (req, res, next) => {

    let {code, event } = req.body;

    
    var settings = {
        "url": "http://localhost:"+ global.serverPort + "/execute?code=" + code + "&event=" + event,
    }

    request.get(settings, function (err, response) {
        res.json( 
            {
                error: err,
                statusCode: response
            }); 
    });
}

const getKey = async (req, res, next) => { 
    res.json({hash: currentHash, fill: currentFill});
}

const connect = async (req, res, next) => {
    let {hash, fill} = req.body;
    let newTopic = crypto.createHash("sha256")
    .update("PENISLOVER")
    .digest()

    if (currentHash == hash && currentFill == fill) {
        res.json({message: "Hyper core is already connected to topic"});
    }
    else {
        swarm.join(newTopic);
        topic = newTopic;
        currentHash = hash;
        currentFill = fill;
        res.json({message: "Hyper core successfully connected to new topic: " + JSON.stringify(newTopic)}); 
    }
}

function encode(data)  {
    let uEnv = b64.base64urlEncode(data);
    return String(uEnv)
}

function decode(encoded)  {
    let uEnv = b64.base64urlDecode(encoded);
    return String(uEnv)
}


const message = async (req, res, next) => {
    let data = encode(String(req.body.data));
    console.log(data);
    res.json({base64String: data});
}

module.exports = {getKey, connect, message, encode, decode, executeCodeRequest, lambda};
