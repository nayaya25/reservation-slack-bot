class ConversationService {
  static async run(witService, text, context) {
    if (!context.conversation) {
      context.conversation = {
        entities: {},
        followUp: "",
        complete: false,
        exit: false,
      };
    }

    if (!text) {
      context.conversation.followUp = "Hey Back";
      return context;
    }

    const entities = await witService.query(text);
    if (context.conversation.complete) {
      context.conversation.entities = { ...entities };
    } else {
      context.conversation.entities = {
        ...context.conversation.entities,
        ...entities,
      };
    }

    if (context.conversation.entities.intent === "farewell") {
      context.conversation.followUp = "Okay, Bye";
      context.conversation.exit = true;
      return context;
    }

    if (context.conversation.entities.intent === "reservation") {
      return ConversationService.intentReservation(context);
    }

    if (context.conversation.entities.intent === "greetings") {
      context.conversation.followUp =
        "Hello, I am Lotus. What can I do for you?";
      return context;
    }
    context.conversation.followUp = "Could you rephrase that please?";
    return context;
  }

  static intentReservation(context) {
    const { conversation } = context;
    const { entities } = conversation;

    if (!entities.reservationDateTime) {
      conversation.followUp =
        "For when would you like to make a reservation, please?";
      return context;
    }

    if (!entities.numberOfGuests) {
      conversation.followUp = "For how many persons, please?";
      return context;
    }

    if (!entities.customerName) {
      conversation.followUp = "Would you tell me your name, please?";
      return context;
    }
    conversation.complete = true;
    return context;
  }
}

module.exports = ConversationService;
