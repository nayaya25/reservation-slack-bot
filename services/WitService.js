const { Wit } = require("node-wit");

class WitService {
  constructor(accessToken) {
    this.client = new Wit(accessToken);
  }

  async query(text) {
    const queryResult = await this.client.message(text);
    const { entities, intents } = queryResult;
    const [intent] = intents;
    const extractedEntities = {};
    extractedEntities["intent"] = intent.name;
    Object.keys(entities).forEach((key) => {
      const [entity] = entities[key];
      if (entity.type === "interval") {
        extractedEntities[entity.role] = entity.to.value;
      } else {
        //   const newKey = key.split(":").pop();
        extractedEntities[entity.role] = entity.value;
      }
    });
    return extractedEntities;
  }
}

module.exports = WitService;
