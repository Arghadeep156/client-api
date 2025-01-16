const { ErrorReply } = require("redis");
const { TicketSchema } = require("./Ticketschema");
const mongoose = require("mongoose");

const insertTicket = async (TicketObj) => {
  try {
    const ticket = new TicketSchema(TicketObj);
    const result = await ticket.save();
    return result;
  } catch (error) {
    throw new ErrorReply(error.message);
  }
};

const getAllTickets = async (userId) => {
  try {
    const ticketLog = await TicketSchema.find({ clientID: userId }).exec();
    return ticketLog;
  } catch (error) {
    console.log("getAllticket - ", error.message);
  }
};

const fetchTicketById = async (ticketId) => {
  try {
    const ticket = await TicketSchema.findById(ticketId).exec();
    return ticket;
  } catch (error) {
    console.log("fetchTicketById - ", error.message);
  }
};

const updateClientReply = async (updateObj) => {
  try {
    // Validate the ObjectId
    const { id, sender, message } = updateObj;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId format");
    }

    // Perform the update
    const result = await TicketSchema.findByIdAndUpdate(
      id,
      {
        $set: { status: "Pending client reponse" },
        $push: {
          conversation: {
            sender,
            message,
          },
        },
      },
      { new: true } // Return the updated document
    );

    // Check if the update was successful
    if (!result) {
      throw new Error("Ticket not found or no updates were made");
    }

    return result;
  } catch (error) {
    console.error("Error updating client reply:", error.message);
  }
};

const closeTicket = async (ticketId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(ticket)) {
      throw new Error("Invalid ObjectId format");
    }
    const result = await TicketSchema.findByIdAndUpdate(
      ticketId,
      { $set: { status: "Closed" } },
      { new: true }
    );
    if (!result) {
      throw new Error(
        "Ticket not found or could not change the status of the ticket"
      );
    }
    console.log(result);
    return result;
  } catch (error) {
    console.log("Close Ticket function errored out", error.message);
  }
};

const deleteTicket = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId format");
    }
    const result = await TicketSchema.findOneAndDelete({ _id: id });
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  insertTicket,
  getAllTickets,
  fetchTicketById,
  updateClientReply,
  closeTicket,
  deleteTicket,
};
