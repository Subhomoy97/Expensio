const router= require('express').Router();
const contactController= require('../../module/contact/controller/contact.controller');
const authCheck= require('../../middleware/auth.middleware')();

router.post('/submit-contact-form',contactController.submitContactForm)

module.exports=router