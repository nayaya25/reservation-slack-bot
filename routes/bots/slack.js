const express = require("express");
const { createEventAdapter } = require("@slack/events-api");
const { WebClient } = require("@slack/web-api");
const router = express.Router();
const moment = require("moment");
const ConversationService = require("../../services/ConversationService");
const createSessionId = (channel, user, ts) => {
  return `${channel}-${user}-${ts}`;
};

module.exports = (params) => {
  const {
    config,
    reservationService,
    witService,
    messageThreadService,
  } = params;

  const slackEvents = createEventAdapter(config.slack.signingSecret);
  const slackWebClient = new WebClient(config.slack.token);

  const handleReservation = async (entities) => {
    const { customerName, reservationDateTime, numberOfGuests } = entities;
    const reservationResult = await reservationService.tryReservation(
      moment(reservationDateTime).unix(),
      numberOfGuests,
      customerName
    );
    return reservationResult.success || reservationResult.error;
  };

  const processEvent = async (session, evt) => {
    const mention = /<@[A-Z0-9]+>/;
    const eventText = evt.text.replace(mention, "").trim();

    const { conversation } = await ConversationService.run(
      witService,
      eventText,
      session.context
    );
    const { entities } = conversation;

    let text = "";
    if (!conversation.complete) {
      text = conversation.followUp;
    } else {
      text = await handleReservation(entities);
      conversation.entities = {};
    }

    return slackWebClient.chat.postMessage({
      text: text,
      channel: session.context.slack.channel,
      thread_ts: session.context.slack.thread_ts,
      username: "Lotus",
    });
  };

  const handleAppMention = async (event) => {
    const { channel, user, thread_ts, ts } = event;
    const sessionId = createSessionId(channel, user, thread_ts || ts);
    let session = messageThreadService.getSession(sessionId);
    if (!session) {
      session = messageThreadService.createSession(sessionId);
      session.context = {
        slack: {
          channel,
          user,
          thread_ts: thread_ts || ts,
        },
      };
    }
    return processEvent(session, event);
  };

  const handleMessage = (evt) => {
    const { channel, user, thread_ts, ts } = evt;
    const sessionId = createSessionId(channel, user, thread_ts, ts);
    session = messageThreadService.getSession(sessionId);
    if (!session) return false;
    return processEvent(session, evt);
  };

  slackEvents.on("app_mention", handleAppMention);
  slackEvents.on("message", handleMessage);

  router.use("/events", slackEvents.requestListener());
  return router;
};
