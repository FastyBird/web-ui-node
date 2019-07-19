const coreHelpers = {

  methods: {

    /**
     * Check if user is signed in or not
     *
     * @returns {Boolean}
     */
    isSignedIn() {
      return this.$cookie.get('token') !== null
    },

    /**
     * Check to see if a slot exists
     *
     * @param  {String} name
     *
     * @return {Boolean}
     */
    slotExists(name) {
      return (name in this.$slots)
    },

    handleFormError(exception, errorMessage) {
      let errorShown = false

      if (exception.response && exception.response.hasOwnProperty('data') && exception.response.data.hasOwnProperty('errors')) {
        for (const key in exception.response.data.errors) {
          if (exception.response.data.errors.hasOwnProperty(key) && parseInt(exception.response.data.errors[key].code, 10) === 422) {
            this.$toasted.error(exception.response.data.errors[key].detail)

            errorShown = true
          }
        }
      }

      if (!errorShown && errorMessage !== null) {
        this.$toasted.error(errorMessage)
      }
    },

    handleRequestError(response, errorMessage) {
      let errorShown = false

      if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('errors')) {
        for (const key in response.data.errors) {
          if (response.data.errors.hasOwnProperty(key) && parseInt(response.data.errors[key].code, 10) === 422) {
            this.$toasted.error(response.data.errors[key].detail)

            errorShown = true
          }
        }
      }

      if (!errorShown && errorMessage !== null) {
        this.$toasted.error(errorMessage)
      }
    },

    getEventElementsPath(event) {
      let path = null

      if (event.hasOwnProperty('path')) {
        path = event.path
      } else if (event.hasOwnProperty('composedPath')) {
        path = typeof event.composedPath === 'function' ? event.composedPath() : event.composedPath
      } else {
        path = this._composedPath(event.target)
      }

      return path
    },

    _composedPath(el) {
      const path = []

      while (el) {
        path.push(el)

        if (el.tagName === 'HTML') {
          path.push(document)
          path.push(window)

          return path
        }

        el = el.parentElement
      }
    },

  },

}

export default coreHelpers
