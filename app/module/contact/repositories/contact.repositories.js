const contactModel = require("../model/contact.model");

class ContactRepository {
  async saveContact(data) {
    const contact = new contactModel(data);
    return await contact.save();
  }
}

module.exports = new ContactRepository();
