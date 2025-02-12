const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const {
  insertTicket,
  getAllTickets,
  fetchTicketById,
  updateClientReply,
  closeTicket,
  deleteTicket,
} = require("./../model/ticket/Ticketmodel");
const userAuthorization = require("./../middlewares/authorizationMiddleware");
const {
  createNewTicketValidation,
  replyTicketMessageValidation,
} = require("./../middlewares/formValidationMiddleware");

// INFO: - WorkFlow
// HACK: - recieve new ticket data.
// TODO - Authorize every request with jwt.
// TODO - insert in mongoDB.
// TODO - Retrieve all the ticket for the specific user.
// TODO - Retrive a ticket from mongoDB.
// TODO - Update message conversation inhte ticket database.
// TODO - Update ticket status / close, perator response missing , client response pending.
// TODO - Delete ticket form mongoDB.

router.all("/", (req, res, next) => {
  next();
});

// INFO: Create new ticket and validate the user and save the created ticket in mongoDB datatbase
router.post(
  "/",
  createNewTicketValidation,
  userAuthorization,
  async (req, res) => {
    try {
      const { subject, sender, message, userID } = req.body;
      const ticketObj = {
        clientID: new mongoose.Types.ObjectId(userID),
        subject,
        conversation: [
          {
            sender,
            message,
          },
        ],
      };
      console.log(ticketObj);
      const value = await insertTicket(ticketObj);
      if (value._id) {
        res.json({
          status: "success",
          message: "New ticket has been created!",
        });
      }
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  }
);

// INFO: Get all the ticket of a specific user.
router.get("/", userAuthorization, async (req, res) => {
  try {
    const { userID } = req.body;

    const ticketArray = await getAllTickets(userID);
    if (!ticketArray) {
      return res.status(404).json({
        status: "error",
        message: "No ticket found against the provided jwt token",
      });
    }
    res.status(200).json({ status: "success", message: ticketArray });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

//INFO: Get a particular ticket using the _id property
router.get("/:id", userAuthorization, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { userID } = req.body;

    //NOTE: Fetch the ticket by its ID from the database
    const result = await fetchTicketById(new mongoose.Types.ObjectId(ticketId));
    console.log(result.clientID, userID);
    //NOTE: Check if the userId matches the clientId of the ticket
    if (result.clientID.toString() === userID) {
      res.json({
        status: "success",
        message: "Ticket fetched successfully",
        data: result,
      });
    } else {
      //NOTE: Handle case where the user is not authorized to view the ticket
      res.status(403).json({
        status: "error",
        message: "User is not authorized to view this ticket",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: `Error fetching ticket: ${error.message}`,
    });
  }
});

//INFO: Edit ticket details using the mongoDb _id property.
router.put(
  "/:id",
  replyTicketMessageValidation,
  userAuthorization,
  async (req, res) => {
    try {
      // Destructure message, sender, and userID from request body
      const { message, sender, userID } = req.body;

      // Destructure ticket ID from request parameters
      const { id } = req.params;

      // Validate input values to ensure they are provided
      if (!message || !sender || !id || !userID) {
        return res.status(400).json({
          status: "error",
          message:
            "All required fields (message, sender, userID) must be provided.",
        });
      }

      // Update the ticket with the provided data
      const result = await updateClientReply({ id, message, sender });

      if (result) {
        // Send a success response if the update is successful
        res.status(200).json({
          status: "success",
          message: "Ticket updated successfully.",
          data: result,
        });
      } else {
        // Handle case where no ticket was found or updated
        res.status(404).json({
          status: "error",
          message: "Ticket not found.",
        });
      }
    } catch (error) {
      // General error handling
      console.error("Error updating ticket:", error);
      res.status(500).json({
        status: "error",
        message: "An error occurred while updating the ticket.",
      });
    }
  }
);

//INFO: Close Ticket
router.patch("/close-ticket/:id", userAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { userID } = req.body;
    //Validate the request parameters
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "All required fields (ticketId) must be provided.",
      });
    }
    const result = await closeTicket(id);
    if (result) {
      res.status(200).json({
        status: "success",
        message: "Ticket closed successfully.",
        data: result,
      });
    } else {
      // Handle case where no ticket was found or updated
      res.status(404).json({
        status: "error",
        message: "Ticket not found.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: `Error closing ticket: ${error.message}`,
    });
  }
});

//INFO: Delete Ticket from the database
router.delete("/:id", userAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTicket(id);
    if (result) {
      res.status(200).json({ message: result });
    }
  } catch (error) {
    res.status(500).json();
  }
});

module.exports = router;
