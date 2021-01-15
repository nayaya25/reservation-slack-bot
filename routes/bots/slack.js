const express = require("express");
const { createEventAdapter } = require("@slack/events-api");
const { WebClient } = require("@slack/web-api");
const router = express.Router();
const moment = require("moment");

module.exports = (params) => {
  const { config, reservationService, witService } = params;

  const slackEvents = createEventAdapter(config.slack.signingSecret);
  const slackWebClient = new WebClient(config.slack.token);

  const handleResponse = async (text) => {
    const entities = await witService.query(text);
    let response = "";
    const {
      intent,
      customerName,
      reservationDateTime,
      numberOfGuests,
    } = entities;

    if (
      !intent ||
      intent !== "reservation" ||
      !customerName ||
      !reservationDateTime ||
      !numberOfGuests
    ) {
      response = "Sorry - Could you rephrase that?";
    } else {
      const reservationResult = await reservationService.tryReservation(
        moment(reservationDateTime).unix(),
        numberOfGuests,
        customerName
      );
      response = reservationResult.success || reservationResult.error;
    }
    return response;
  };

  const handleAppMention = async (event) => {
    const mention = /<@[A-Z0-9]+>/;
    const eventText = event.text.replace(mention, "").trim();
    let text = "";
    if (!eventText || eventText === "") {
      text = "Hey";
    } else {
      text = await handleResponse(eventText);
    }

    return slackWebClient.chat.postMessage({
      text: text,
      channel: event.channel,
      username: "Lotus",
    });
  };
  slackEvents.on("app_mention", handleAppMention);
  router.use("/events", slackEvents.requestListener());
  return router;
};
