export const state = () => ({
  conditions: {
    things: [],
    schedules: [],
  },
  actions: [],
  notifications: [],
})

export const getters = {

  getThingsConditions: moduleState => () => {
    return moduleState.conditions.things
  },

  getSchedulesConditions: moduleState => () => {
    return moduleState.conditions.schedules
  },

  getActions: moduleState => () => {
    return moduleState.actions
  },

  getNotifications: moduleState => () => {
    return moduleState.notifications
  },

}

export const actions = {

  addCondition(module, { data }) {
    for (const index in module.state.conditions.things) {
      if (Object.prototype.hasOwnProperty.call(module.state.conditions.things, index)) {
        if (JSON.stringify(module.state.conditions.things[index]) === JSON.stringify(data)) {
          // Same condition added, nothing to do
          return
        } else if (
          module.state.conditions.things[index].device === data.device &&
          module.state.conditions.things[index].channel === data.channel
        ) {
          // Conditions thing is updated
          module.commit('REPLACE_CONDITION', {
            data,
            index,
          })

          return
        }
      }
    }

    module.commit('ADD_CONDITION', { data })
  },

  toggleCondition(module, { device, channel }) {
    for (const index in module.state.conditions.things) {
      if (
        Object.prototype.hasOwnProperty.call(module.state.conditions.things, index) &&
        module.state.conditions.things[index].device === device &&
        module.state.conditions.things[index].channel === channel
      ) {
        module.commit('TOGGLE_CONDITION', { index })
      }
    }
  },

  removeCondition(module, { device, channel }) {
    for (const index in module.state.conditions.things) {
      if (
        Object.prototype.hasOwnProperty.call(module.state.conditions.things, index) &&
        module.state.conditions.things[index].device === device &&
        module.state.conditions.things[index].channel === channel
      ) {
        module.commit('REMOVE_CONDITION', { index })
      }
    }
  },

  addSchedule(module, { data }) {
    for (const index in module.state.conditions.schedules) {
      if (Object.prototype.hasOwnProperty.call(module.state.conditions.schedules, index)) {
        if (JSON.stringify(module.state.conditions.schedules[index]) === JSON.stringify(data)) {
          // Same condition added, nothing to do
          return
        } else {
          // Enabled by default
          Object.assign(data, { enabled: true })

          // Conditions thing is updated
          module.commit('REPLACE_SCHEDULE', {
            data,
            index,
          })

          return
        }
      }
    }

    // Enabled by default
    Object.assign(data, { enabled: true })

    module.commit('ADD_SCHEDULE', { data })
  },

  addAction(module, { data }) {
    for (const index in module.state.actions) {
      if (Object.prototype.hasOwnProperty.call(module.state.actions, index)) {
        if (JSON.stringify(module.state.actions[index]) === JSON.stringify(data)) {
          // Same action added, nothing to do
          return
        } else if (
          module.state.actions[index].device === data.device &&
          module.state.actions[index].channel === data.channel
        ) {
          // Action thing is updated
          module.commit('REPLACE_ACTION', {
            data,
            index,
          })

          return
        }
      }
    }

    module.commit('ADD_ACTION', { data })
  },

  toggleAction(module, { device, channel }) {
    for (const index in module.state.actions) {
      if (
        Object.prototype.hasOwnProperty.call(module.state.actions, index) &&
        module.state.actions[index].device === device &&
        module.state.actions[index].channel === channel
      ) {
        module.commit('TOGGLE_ACTION', { index })
      }
    }
  },

  removeAction(module, { device, channel }) {
    for (const index in module.state.actions) {
      if (
        Object.prototype.hasOwnProperty.call(module.state.actions, index) &&
        module.state.actions[index].device === device &&
        module.state.actions[index].channel === channel
      ) {
        module.commit('REMOVE_ACTION', { index })
      }
    }
  },

  clear(module) {
    module.commit('CLEAR')
  },

}

export const mutations = {

  ['ADD_CONDITION'](moduleState, action) {
    moduleState.conditions.things.push(action.data)
  },

  ['REPLACE_CONDITION'](moduleState, action) {
    moduleState.conditions.things.splice(action.index, 1, action.data)
  },

  ['TOGGLE_CONDITION'](moduleState, action) {
    const data = Object.assign(moduleState.conditions.things[action.index], { enabled: !moduleState.conditions.things[action.index].enabled })

    moduleState.conditions.things.splice(action.index, 1, data)
  },

  ['REMOVE_CONDITION'](moduleState, action) {
    moduleState.conditions.things.splice(action.index, 1)
  },

  ['ADD_SCHEDULE'](moduleState, action) {
    moduleState.conditions.schedules.push(action.data)
  },

  ['REPLACE_SCHEDULE'](moduleState, action) {
    moduleState.conditions.schedules.splice(action.index, 1, action.data)
  },

  ['ADD_ACTION'](moduleState, action) {
    moduleState.actions.push(action.data)
  },

  ['REPLACE_ACTION'](moduleState, action) {
    moduleState.actions.splice(action.index, 1, action.data)
  },

  ['TOGGLE_ACTION'](moduleState, action) {
    const data = Object.assign(moduleState.actions[action.index], { enabled: !moduleState.actions[action.index].enabled })

    moduleState.actions.splice(action.index, 1, data)
  },

  ['REMOVE_ACTION'](moduleState, action) {
    moduleState.actions.splice(action.index, 1)
  },

  ['CLEAR'](moduleState) {
    moduleState.conditions.things.splice(0, moduleState.conditions.things.length)
    moduleState.conditions.schedules.splice(0, moduleState.conditions.schedules.length)

    moduleState.actions.splice(0, moduleState.actions.length)
    moduleState.notifications.splice(0, moduleState.notifications.length)
  },

}
