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
router.get(['/:cid', '/'], cors(), beamController.getKey);
router.post( 
    '/node', cors(), 
    [
        check('data')
        .isEmpty()
        .withMessage("Data is required")
    ], 
    beamController.push
);

router.patch(
    '/', cors(),
    [
        // Validation chain: check()..trim().not().isEmpty().withMessage()
       
            check('key')
            .trim()
            .not()
            .isEmpty()
            .withMessage("Connection key is required")
    ],    
    beamController.connect
);





module.exports = router;