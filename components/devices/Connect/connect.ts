import {
  computed,
  reactive,
  ref,
} from '@vue/composition-api'

import uuid from 'uuid'

import Device from '~/models/devices-node/devices/Device'
import {
  DeviceEntityTypes,
  DeviceInterface,
} from '~/models/devices-node/devices/types'

import Account from '~/models/auth-node/accounts/Account'
import Identity from '~/models/auth-node/identities/Identity'

export enum ProtocolTypes {
  MQTT = 'mqtt',
  UDP = 'udp',
  SIGFOX = 'sigfox',
  LORA = 'lora',
}

export enum ProcessingResultTypes {
  NONE = 'none',
  REGISTERING = 'registering',
  GRANTING_ACCESS = 'granting_access',
  ERROR = 'error',
  OK = 'ok',
}

export default function() {
  const deviceId = uuid.v4().toString()

  const step = ref<number>(1)

  const protocol = ref<ProtocolTypes>(ProtocolTypes.MQTT)

  const working = reactive({
    status: ProcessingResultTypes.NONE,
    loadAccountAttempts: 0,
  })

  const device = computed<DeviceInterface | null>((): DeviceInterface | null => {
    return Device.find(deviceId)
  })

  let timer: number

  async function handleGrantAccess(): Promise<void> {
    try {
      working.status = ProcessingResultTypes.GRANTING_ACCESS

      const identity = Identity.query().where('accountId', deviceId).first()

      if (identity !== null) {
        await Identity.dispatch('save', {
          identity,
        })

        working.status = ProcessingResultTypes.OK
      } else {
        await Device.dispatch('remove', {
          device: device.value,
        })
      }
    } catch (e) {
      await Device.dispatch('remove', {
        device: device.value,
      })

      working.status = ProcessingResultTypes.ERROR

      throw (e)
    }
  }

  async function handleCheckAccount(): Promise<void> {
    try {
      working.loadAccountAttempts++

      await Account.dispatch('get', {
        id: deviceId,
      })

      window.clearInterval(timer)
    } catch (e) {
      if (working.loadAccountAttempts > 5) {
        window.clearInterval(timer)

        await Device.dispatch('remove', {
          device: device.value,
        })

        working.status = ProcessingResultTypes.ERROR
      }
    }

    await handleGrantAccess()
  }

  async function registerDevice(): Promise<void> {
    if (device.value !== null) {
      working.status = ProcessingResultTypes.REGISTERING

      try {
        await Device.dispatch('save', {
          device: device.value,
        })

        timer = window.setInterval(handleCheckAccount, 2000)
      } catch (e) {
        await Device.dispatch('remove', {
          device: device.value,
        })

        working.status = ProcessingResultTypes.ERROR

        throw (e)
      }
    } else {
      working.status = ProcessingResultTypes.ERROR
    }
  }

  function initialiseDevice(): void {
    Device.dispatch('add', {
      id: deviceId,
      draft: true,
      data: {
        type: DeviceEntityTypes.PHYSICAL,
        identifier: uuid.v4().toString(),
      },
    })
  }

  function destroyDevice(): void {
    if (device.value !== null && device.value.draft) {
      const account = Account.find(device.value.id)

      if (account !== null) {
        const identity = Identity.query().where('accountId', account.id).first()

        if (identity !== null) {
          Identity.dispatch('remove', {
            identity,
          })
        }

        Account.dispatch('remove', {
          account,
        })
      }

      Device.dispatch('remove', {
        device: device.value,
      })
    }
  }

  return {
    deviceId,
    step,
    protocol,
    working,
    device,
    registerDevice,
    initialiseDevice,
    destroyDevice,
  }
}
