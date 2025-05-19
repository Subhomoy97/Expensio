const sendContactMail = require("../../../helper/sendContactMail");
const contactRepository = require("../repositories/contact.repositories");
const{contactSchema}=require('../../../validations/contact.validation')

class ContactController {
  async submitContactForm(req, res) {
    try {
      const { error, value } = contactSchema.validate(req.body, { abortEarly: false });
            if (error) {
                const messages = error.details.map(detail => detail.message);
                return res.status(400).send({
                    status: 400,
                    data: {},
                    message: messages
                });
            }
      const { name, email, subject, message } = value;

      // Save to DB using repository
      await contactRepository.saveContact({ name, email, subject, message });

      // Send email
      const mailResult = await sendContactMail(name, email, subject, message);

      if (!mailResult.success) {
        return res.status(500).json({ message: 'Message saved, but email sending failed.' });
      }

      res.status(201).json({ message: 'Message sent successfully!' });
    } catch (err) {
      console.error('Contact form error:', err);
      res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
  }
}

module.exports = new ContactController();
