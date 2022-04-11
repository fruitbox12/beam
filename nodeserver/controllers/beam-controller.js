// Use object de-structuring
const b64 = require('b64');
const Hyperswarm = require('hyperswarm')
const request = require('request');
const { exec } = require("child_process");


var currentSize = 32;
var currentFill = "PENISLOVER32";
var topic = Buffer.alloc(currentSize).fill(currentFill) // A topic must be 32 bytes


const swarm = new Hyperswarm();

const create = async () => {
    const discovery = swarm.join(topic, { server: true, client: false })
    await discovery.flushed() // Waits for the topic to be fully announced on the DHT
}
// CRUD operations

create();

swarm.on('connection', (conn, info) => {
    // swarm will receive server connections
    conn.write('Successful connection to peer');
    conn.on('data', data => console.log('client got message:', data.toString()))
    conn.end();
});

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
    if (swarm.keyPair) {
        // Return id getter from _id property
        res.json({size: currentSize, fill: currentFill});
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
    let {size, fill} = req.body;
    let newTopic = Buffer.alloc(size).fill(fill);

    if (currentSize == size && currentFill == fill) {
        res.json({message: "Hyper core is already connected to topic"});
    }
    else {
        const discovery = swarm.join(newTopic, { server: false, client: true })
        await discovery.flushed();
        topic = newTopic;
        currentSize = size;
        currentFill = fill;
        res.json({message: "Hyper core successfully connected to new topic: " + newTopic}); 
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
    swarm.write(data);
    res.json({base64String: data});
}

module.exports = {getKey, connect, message, encode, decode, executeCodeRequest, lambda};