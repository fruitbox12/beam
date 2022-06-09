// Variables created as part of global object are available everywhere in the project.
// Using Global Variables in Node.js
// https://stackabuse.com/using-global-variables-in-node-js/
global.serverPort = 5000
// Using MongoDB Explain with Mongoose
// https://masteringjs.io/tutorials/mongoose/explain
// Parameters (explainations)
//  .explain('queryPlanner'), .explain('executionStats'), or .explain('allPlansExecution'). Default: 'queryPlanner'.
// .explain('true') shows all explainations. Does not run the query.
// .explain('false') shows no explainations. Runs query.
// Query Planner output:
// winningPlan is useful for checking whether MongoDB used an index for the query or not.
// stage: 'COLLSCAN' means an index was NOT used.
// inputStage: ... stage: 'IXSCAN' means an index was used, its name is given by the indexName property.

// Schema based data modeling for mongodb
// https://mongoosejs.com/docs/mongoose
// Whats difference btween ODM and ORM?

// HTTP request logger
// how to use morgan in your express project
const morgan = require('morgan')
const bodyParser = require('body-parser')
const HttpError = require('./models/http-error')
const express = require('express')
const connectionRoutes = require('./routes/connection-routes')
const path = require('path')
// Custom error class

// Get instance of Express
const app = express()

// REgister middleware
app.use(morgan('tiny'))
app.use(bodyParser.json())

// Route prefix
app.use('/api', connectionRoutes)
app.use('/api/static', express.static(path.join(__dirname, 'public')))
// Catch unsupported routes (http 400 - bad request) Must come after all registered middleware routes
app.use((req, res, next) => {
  return next(new HttpError(400, 'Route not defined.'))
})

// Default error handling middleware. Use if any middleware before it throws an error
// to prevent server from crashing
// Route controllers use try/catch to try and catch errors
app.use((error, req, res, next) => {
  // Check if a response has already been set. Only one can be sent, otherwise error will be thrown
  if (res.headerSent) {
    return next.error
  }

  res.status(error.code || 500).json({
    message: error.message || 'An unknown error as occured. Try again later.',
  })
})

app.listen(global.serverPort)
