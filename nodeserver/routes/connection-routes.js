// Use object de-structuring
const { Router } = require('express');
const { route } = require('express/lib/application');
const beamController = require('../controllers/beam-controller')
const { check, oneOf } = require('express-validator');

const cors  = require('cors');
// Buid a REST API with Node.js and Express.js
// https://restfulapi.net/
// https://www.smashingmagazine.com/2018/01/understanding-using-rest-api/
// https://www.edureka.co/blog/what-is-rest-api/
// HTTP response status codes
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
// 7 HTTP methods every web developer should know and how to test them
// https://assertible.com/blog/7-http-methods-every-web-developer-should-know-and-how-to-test-them

const router = Router();

// REST API endpoints (aka routes)
// The order of the routes matter
// From server.js app.use(...)
// '/' is a suffix to the prefix specified in server.js app.use()
// Route using dynamic params (start with : and seperate with &)
router.get(['/id'], cors(), beamController.getKey);



router.post(
    '/lambda', cors(), 
    [
        check('code')
        .isEmpty()
        .withMessage('Code is required')
    ],
    beamController.lambda
);

router.post( 
    '/node', cors(), 
    [
        check('data')
        .isEmpty()
        .withMessage("Data is required")
    ], 
    beamController.message
    
);

router.post( 
        '/execute', cors(), 
        [
            check('code')
            .isEmpty()
            .withMessage("code is required"),
            check("event")
            .isEmpty()
            .withMessage("event is required")
        ],
        beamController.executeCodeRequest
);

router.patch(
    '/connect', cors(),
    [
        // Validation chain: check()..trim().not().isEmpty().withMessage()
       
            check('hash')
            .not()
            .isEmpty()
            .withMessage("hash is required"),
            check('fill')
            .not()
            .isEmpty()
            .withMessage("fill is required"),
    ],    
    beamController.connect
);

module.exports = router;