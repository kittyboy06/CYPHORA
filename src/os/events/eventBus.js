/**
 * CYPHORA Virtual OS — In-Memory Event Bus
 * Decouples the OS shell from task and validation engines.
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} eventName
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName
   * @param {Function} callback
   */
  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).delete(callback);
    }
  }

  /**
   * Emit an event with payload
   * @param {string} eventName
   * @param {object} payload
   */
  emit(eventName, payload = {}) {
    const eventData = {
      event: eventName,
      payload,
      timestamp: new Date().toISOString()
    };

    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).forEach(cb => {
        try {
          cb(eventData);
        } catch (err) {
          console.error(`[EventBus] Error in listener for ${eventName}:`, err);
        }
      });
    }

    // Catch-all listener (useful for logger and future task engine)
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => {
        try {
          cb(eventData);
        } catch (err) {
          console.error(`[EventBus] Error in wildcard listener:`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();
