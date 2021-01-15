class MessageThreadService {
  constructor() {
    this.sessions = {};
    this.timeout = 60 * 5;
  }

  static now() {
    return Math.floor(new Date() / 1000);
  }

  createSession(sessionId) {
    this.cleanup();
    this.sessions[sessionId] = {
      timestamp: MessageThreadService.now(),
      context: {},
    };

    return this.sessions[sessionId];
  }

  getSession(sessionId) {
    this.cleanup();
    if (!this.sessions[sessionId]) return false;
    this.updateSession(sessionId);
    return this.sessions[sessionId];
  }

  deleteSession(sessionId) {
    if (!this.sessions[sessionId]) return false;
    delete this.sessions[sessionId];
    return true;
  }

  updateSession(sessionId) {
    this.cleanup();
    if (!this.sessions[sessionId]) return false;
    this.sessions[sessionId].timestamp = MessageThreadService.now();
    return this.sessions[sessionId];
  }

  cleanup() {
    const now = MessageThreadService.now();
    Object.keys(this.sessions).forEach((key) => {
      const session = this.sessions[key];
      if (session.timestamp + this.timeout < now) {
        this.delete(key);
      }
    });
    return true;
  }
}

module.exports = MessageThreadService;
