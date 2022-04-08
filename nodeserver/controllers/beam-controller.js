// Use object de-structuring
const b64 = require('b64');
const exec  = require("child_process");
const Hyperswarm = require('hyperswarm')
const request = require('request');

var currentSize = 32;
var currentFill = "hello world";
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



const executeCodeRequest = async (req, res, next) => {

    let {code, event } = req.body;

    
    var settings = {
        "url": "http://localhost:"+ global.serverPort + "/execute?code=" + code + "&event=" + event,
    }

    request.get(settings, function (error, response) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response); // Print the response status code if a response was received
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
    let {size, fill} = String(req.body);
    let newTopic = Buffer.alloc(size).fill(fill);

    if (currentSize == size && currentFill == fill) {
        res.json({message: "Hyper core is already connected to topic"});
    }
    else {
        swarm.join(newTopic, { server: false, client: true })
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

const push = async (req, res, next) => {
    let data = encode(String(req.body.data));
    swarm.write(data);
    res.json({base64String: data});
}



module.exports = {getKey, connect, push};