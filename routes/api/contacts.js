const express = require("express");
const router = express.Router();
const Joi = require("joi");
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://developerstevenmarin:%40Mongo2023@nodejs-homework-api-res.3fnzywr.mongodb.net/db-contacts",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

const Contact = require("../../models/contacts"); 

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Exiting the process due to database connection error");
    process.exit(1);
  }
});


router.get("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  try {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }
    res.status(200).json({ contact });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Exiting the process due to database connection error");
    process.exit(1);
  }
});


router.post("/", async (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newContact = await mongoose.model("Contact").create(req.body);
    res.status(201).json({ message: "Added new contact", contact: newContact });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Exiting the process due to database connection error");
    process.exit(1);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  try {
    const deletedContact = await Contact.findByIdAndRemove(contactId);
    if (!deletedContact) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }
    res.status(200).json({ message: `Deleted contact: ${contactId}` });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Exiting the process due to database connection error");
    process.exit(1);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const { name, email, phone } = req.body;
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { name, email, phone },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res
      .status(200)
      .json({
        message: `Updated contact: ${contactId}`,
        contact: updatedContact,
      });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Exiting the process due to database connection error");
    process.exit(1);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  const contactId = req.params.contactId;
  const { favorite } = req.body;

  if (favorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      { new: true } 
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await updatedContact.save(); 

    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Exiting the process due to database connection error");
    process.exit(1);
  }
});

module.exports = router;