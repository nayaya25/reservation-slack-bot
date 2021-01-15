const { Wit } = require("node-wit");

class WitService {
  constructor(accessToken) {
    this.client = new Wit(accessToken);
  }

  async query(text) {
    const queryResult = await this.client.message(text);
    const extractedEntities = {};
    const { entities, intents } = queryResult;
    intents &&
      intents.map((intent) => {
        extractedEntities["intent"] = intent.name;
      });

    Object.keys(entities).forEach((key) => {
      const [entity] = entities[key];
      if (entity.confidence > 0.7) {
        if (entity.type === "interval") {
          extractedEntities[entity.role] = entity.to.value;
        } else {
          extractedEntities[entity.role] = entity.value;
        }
      }
    });
    return extractedEntities;
  }
}

module.exports = WitService;
