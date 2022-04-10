const uuid = require('uuid').v4;
const mongoose = require('mongoose');
const postalCodes = require('postal-codes-js');
// Use object de-structuring
const { validationResult } = require('express-validator');

const {Contact, Phone, Email} = require('../models/contact');
const helpers = require('../helpers/helpers');
// CRUD operations

const getContacts = async (req, res, next) => { 
    // Any param not passed will set its constant to undefined
    // Preference given to body params over dynamic or query params
    const bodyContactId = req.body.id;
    const bodyFirstName = req.body.firstName;
    const bodyLastName = req.body.lastName;
    const bodyPhoneNumber = req.body.phone;
    const bodyEmailAddress = req.body.email;
    const bodyStreetAddress = req.body.streetAddress;
    const bodyCity = req.body.city;
    const bodyState = req.body.state;
    const bodyZipcode = req.body.zipcode;
    const bodyCountryCode = req.body.countryCode;

    const queryContactId = req.query.id;
    const queryFirstName = req.query.firstName;
    const queryLastName = req.query.lastName;
    const queryPhoneNumber = req.query.phone;
    const queryEmailAddress = req.query.email;
    const queryStreetAddress = req.query.streetAddress;
    const queryCity = req.query.city;
    const queryState = req.query.state;
    const queryZipcode = req.query.zipcode;
    const queryCountryCode = req.query.countryCode;

    const dynamicContactId = req.params.cid;

    // const { cid } = req.params;
  

    let filter = {};

    // Check if contactId is truthy
    if (bodyContactId) {
        filter._id = bodyContactId;
    }
    else if (queryContactId) {
        filter._id = queryContactId;
    }
    else if (dynamicContactId) {
        filter._id = dynamicContactId;
    }

    if (filter._id && !helpers.isObjectIdValid(filter._id)) {
        return res.status(422).json({
            message: 'Invalid get contact request. A valid contact ID must be specified.',
            contactId: filter._id
        });
    }

    if (bodyFirstName) {
        Object.assign(filter, { "firstName": { $regex: bodyFirstName, '$options' : 'i' }});
    }
    else if (queryFirstName) {
        Object.assign(filter, { "firstName": { $regex: queryFirstName, '$options' : 'i' }});
    }

    if (bodyLastName) {
        Object.assign(filter, { "lastName": { $regex: bodyLastName, '$options' : 'i' }});
    }
    else if (queryLastName) {
        Object.assign(filter, { "lastName": { $regex: queryLastName, '$options' : 'i' }});
    }
    if (bodyPhoneNumber) {
        // Must create the phones array to prevent error
        Object.assign(filter, { "phones.phone": { $regex: bodyPhoneNumber, '$options' : 'i' }});
    }
    else if (queryPhoneNumber) {
        Object.assign(filter, { "phones.phone": { $regex: queryPhoneNumber, '$options' : 'i'  }});
    }

    if (bodyEmailAddress) {
        // Full or partial email address match
        // Must use case-insensitive regex to find all possible matches
        Object.assign(filter, { "emails.email": { $regex: bodyEmailAddress, '$options' : 'i' }});
    }
    else if (queryEmailAddress) {
        Object.assign(filter, { "emails.email": { $regex: queryEmailAddress, '$options' : 'i' }});
    }
    if (bodyStreetAddress) {
      
        Object.assign(filter, { "streetAddress": { $regex: bodyStreetAddress, '$options' : 'i' }});
    }
    else if (queryStreetAddress) {
        Object.assign(filter, { "streetAddress": { $regex: queryStreetAddress, '$options' : 'i' }});
    }
    if (bodyCity) {
      
        Object.assign(filter, { "city": { $regex: bodyCity, '$options' : 'i' }});
    }
    else if (queryCity) {
        Object.assign(filter, { "city": { $regex: queryCity, '$options' : 'i' }});
    }
    if (bodyState) {
      
        Object.assign(filter, { "state": { $regex: bodyState, '$options' : 'i' }});
    }
    else if (queryState) {
        Object.assign(filter, { "state": { $regex: queryState, '$options' : 'i' }});
    }
    if (bodyZipcode) {
      
        Object.assign(filter, { "zipcode": { $regex: bodyZipcode, '$options' : 'i' }});
    }
    else if (queryZipcode) {
        Object.assign(filter, { "zipcode": { $regex: queryZipcode, '$options' : 'i' }});
    }
    if (bodyCountryCode) {
      
        Object.assign(filter, { "countryCode": { $regex: bodyCountryCode, '$options' : 'i' }});
    }
    else if (queryCountryCode) {
        Object.assign(filter, { "countryCode": { $regex: queryCountryCode, '$options' : 'i' }});
    }
    
    let contacts;

    try {
       // Use call to explain(true) to determine Mongoose processing.
        // 1. If you want a case-insensitive search you must specify it on call to find().
        // 2. If a case-insensitive search is specified on call to find() and a case-insensitive collation index
        //    is not found, Mongoose will NOT perform a case-insensity search via a full collection scan (COLLSCAN)
        //    without an index.
        // 3. If a case-insensitive search is not specified on call to find(), Mongoose will ignore
        //    a case-insensitive collation index for the filter property and a full collection scan (COLLSCAN)
        //    without an index.
        // To perform a case insensitive search, must call find with collation {'locale': 'en_US', 'strength': 2 } regardkess of the existence of a case insensitive index 
        // 1. Search fields must specifiy case insensitive values 
        // 2. Must call find(0 with collation regardless of existense of case-insensitive index
        //var query = {$and:[{lastName:{regex:queryLastName, $options: 'i'}}, {firstName:{regex:queryFirstName, $options: 'i'}}]};

        contacts = await Contact.find(filter).collation({'locale': 'en_US', 'strength': 2 }).hint('lastName-firstName', 1).explain(global.explain).orFail();
      
        //contacts = await Contact.find(filter).collation({'locale': 'en_US', 'strength': 2 }).explain(global.explain).orFail();
        
    }
    catch (err) {
        return res.status(404).json({ 
        message: "Contact not found.",
        id: filter._id, 
        firstName: filter.firstName,
        lastNae: filter.lastName,
        phones: filter.phones,
        email: filter.emails,
        reason: err.message
        });
    }
    if (Array.isArray(contacts)) {
        // Return id getter from _id property
        res.json({contact: contacts.map(contact => contact.toObject({getters: true}))});
    }
    else {
        res.status(200).json({queryPlanner: contacts.queryPlanner, executionStats: contacts.executionStats });
    }
}

const create = async (req, res, next) => { 
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty) {
        // bad request, invalid data
        // use next(0 instead of retruning or throwing errors with async code)
        return next(res.status(422).json({
            message: 'Invalid create contact request',
            reason: validationErrors
        }))
    }

    let {firstName, middleName, lastName, phones, streetAddress, city, state, zipcode, countryCode, emails, image} = req.body;
    
    if (!firstName) firstName           = "";
    if (!middleName) middleName         = "";
    if (!lastName) lastName             = "";
    if (!streetAddress) streetAddress   = "";
    if (!city) city                     = "";
    if (!state) state                   = "";
    if (!zipcode) zipcode               = "";
    if (!countryCode) countryCode       = "";
    if (!image) image                   = "";

    // Create a contact 
    // Using shorter form because the key and the value names are the same
    const newContact = new Contact({
        firstName, 
        middleName, 
        lastName, 
        phones, 
        streetAddress, 
        city, 
        state, 
        zipcode, 
        countryCode, 
        emails, 
        image
    })

    try {
       await newContact.save();
    }
    catch (err) {
        return res.status(500).json({
            message: "Create new contact failed. Try again later",
            reason: err.message
        });
    }

    res.status(200).json({ createdContact: newContact.toObject( {getters: true }) });
}

// What’s the Difference between PUT vs PATCH?
// https://rapidapi.com/blog/put-vs-patch/
// PUT is a method of modifying a resource where the client sends data that updates the ENTIRE resource.
// It is used to set an entity’s information COMPLETELY.
// PUT is similar to POST in that it can create resources, but it does so when there is a defined URI. 
// PUT overwrites the ENTIRE entity if it already exists, and creates a new resource if it doesn’t exist.
// For example, when you want to change the first name of a person in a database, 
// you need to send the entire resource when making a PUT request.

// Unlike PUT, PATCH applies a partial update to the resource.
// This means that you are only required to send the data that you want to update, 
// and it won’t affect or change anything else. So if you want to update the first name on a database, 
// you will only be required to send the first parameter; the first name.
const update = async (req, res, next) => {

    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty) {
        // bad request, invalid data
        // use next(0 instead of retruning or throwing errors with async code)
        return next(res.status(422).json({
            message: 'Invalid create contact request',
            reason: validationErrors
        }))
    }
    // Body Params
    const bodyContactId = req.body.id;


    const queryContactId = req.query.id;
    
    const dynamicContactId = req.params.cid

    let filter = {};

    if (bodyContactId) {
        filter._id = bodyContactId;
    }
    else if (queryContactId) {
        filter._id = queryContactId;
    }
    else if (dynamicContactId) {
        filter._id = dynamicContactId;
    }

    if (!filter._id || (filter._id && !helpers.isObjectIdValid(filter._id))) {
        return res.status(422).json({
            message: 'Invalid get contact request. A valid contact ID (ObjectId) must be specified.',
            contactId: filter._id || "Missing Contact Id"
        });
    }
    let contact;

    try {
        contact = await Contact.findOne(filter).orFail();
    }
    catch (err) {
        return res.status(500).json({
            message: "Contact not found",
            id: filter._id,
            reason: err.message
        });
    }

    // Request the body parsed by app.use(bodyParser.json()) in server.js 
    // Phones and emails must be arrays. otherwise http error 500 is reported
    const {firstName, middleName, lastName, phones, streetAddress, city, state, zipcode, countryCode, emails, image} = req.body;

    let updated = false;

    if (firstName) {
        contact.firstName = firstName;
        updated = true;

    }
    if (middleName) {
        contact.middleName = middleName;
        updated = true;
    }
    if (lastName) {
        contact.lastName = lastName;
        updated = true;
    }
    if (phones) {
        updated = true;
       for(let index = 0; index < phones.length; index++) {
            // Check if this number exists to be updated
            let phone = phones[index];
            // If returned array contactsPhones is empty, add this new phone
            // if returned array length is one, update this phone 
            // If phoneNumber exists more than once, validate the updated phone type, if not in use by contact
            let contactPhones = contact.phones.filter(item => item.phone == phone);

            if (contactPhones.length == 0) {
                // New phone, add it
                contact.phones.push(phone);
            }
            else if (contactPhones.length == 1) {
                // existing phone, update it
                const index = contact.phones.findindex(element => element.phone == phone);
                contact.phones[index].countryCode = phone.countryCode;
                contact.phones[index].type = phone.type;
                contact.phones[index].phone = phone.phone;
            }
            else if (contactPhones.length > 1) {

                // If an existing phone id was passed, validate the updated phone type is not already in use for this contact
                if (phone._id) {
                    if (contact.phones.find(element => element.type == type)) {
                        // Bad request, invalid data
                        return res.status(422).json({
                            message: 'Invalid update contact request. A phone type and number can only appear once.',
                            phoneType: item.type,
                            phoneNumber: phone
                        });
                    }
                }
                else {
                    // Existing phone, update it
                }
            }
            
        }

    }
    if (emails) {
        Object.assign(filter, { "emails.email": { $regex: emails }})
        updated = true;
    }
    if (streetAddress) {
        contact.streetAddress = streetAddress;
        updated = true;
    }
    if (city) {
        contact.city = city;
        updated = true;
    }
    if (state) {
        contact.state = state;
        updated = true;
    }
    if (zipcode) {
        contact.zipcode = zipcode;
        updated = true;
    }
    if (countryCode) {
        contact.countryCode = countryCode;
        updated = true;
    }
    let updatedContact;

    if (updated) {
        try {
            // Mongoose: if document is found returns updated document (new:true)
            updatedContact = await contact.save({new: true});
        }
        catch (err) {
            return res.status(404).json({ 
                message: "Contact wid id '" + contact._id + "' not found.",
                reason: err.message
            })
        }
    }
    // Standard status when something successfully created
    res.status(200).json({ updatedContact: updatedContact.toObject( {getters: true }) });

}

const deleteContact = (req, res, next) => {

}

module.exports = {getContacts, create, update, deleteContact};