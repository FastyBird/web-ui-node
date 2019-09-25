const mixin = {

  methods: {

    /**
     * Connect thing to WS channels
     *
     * @param {String} id
     *
     * @private
     */
    subscribeToThingExchange(id) {
      const topic = this.$ioServerThingsSocket.getTopic(id)

      return this.$wamp
        .subscribe(topic, (data) => {
          const body = JSON.parse(data)

          this.$ioServerThingsSocket.updated(body)
        })
        .then(() => {
          this.$ioServerThingsSocket.subscribed(id)
        })
    },

    /**
     * Disconnect thing from WS channels
     *
     * @param {String} id
     *
     * @private
     */
    unsubscribeFromThingExchange(id) {
      const topic = this.$ioServerThingsSocket.getTopic(id)

      return this.$wamp
        .unsubscribe(topic)
        .then(() => {
          this.$ioServerThingsSocket.unsubscribed(id)
        })
    },

  },

}

export default mixin
