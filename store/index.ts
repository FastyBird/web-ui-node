import VuexORM, { Database } from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import VuexORMWamp from '@fastybird/vuex-orm-wamp'

import { IO_SOCKET_TOPIC_EXCHANGE } from '~/configuration'

// Auth node
import Account from '~/models/auth-node/accounts/Account'
import accounts from '~/models/auth-node/accounts'
import Email from '~/models/auth-node/emails/Email'
import emails from '~/models/auth-node/emails'
import Identity from '~/models/auth-node/identities/Identity'
import identities from '~/models/auth-node/identities'

// Devices node
import Device from '~/models/devices-node/devices/Device'
import devices from '~/models/devices-node/devices'
import Hardware from '~/models/devices-node/hardwares/Hardware'
import Firmware from '~/models/devices-node/firmwares/Firmware'
import DeviceProperty from '~/models/devices-node/device-properties/DeviceProperty'
import deviceProperties from '~/models/devices-node/device-properties'
import DeviceConfiguration from '~/models/devices-node/device-configuration/DeviceConfiguration'
import Channel from '~/models/devices-node/channels/Channel'
import channels from '~/models/devices-node/channels'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'
import channelProperties from '~/models/devices-node/channel-properties'
import ChannelConfiguration from '~/models/devices-node/channel-configuration/ChannelConfiguration'

// Triggers node
import Trigger from '~/models/triggers-node/triggers/Trigger'
import triggers from '~/models/triggers-node/triggers'
import Condition from '~/models/triggers-node/conditions/Condition'
import conditions from '~/models/triggers-node/conditions'
import Action from '~/models/triggers-node/actions/Action'
import actions from '~/models/triggers-node/actions'
import Notification from '~/models/triggers-node/notifications/Notification'
import notifications from '~/models/triggers-node/notifications'

// Create new instance of Database.
const database = new Database()

database.register(Account, accounts)
database.register(Email, emails)
database.register(Identity, identities)

database.register(Device, devices)
database.register(Hardware)
database.register(Firmware)
database.register(DeviceProperty, deviceProperties)
database.register(DeviceConfiguration)
database.register(Channel, channels)
database.register(ChannelProperty, channelProperties)
database.register(ChannelConfiguration)

database.register(Trigger, triggers)
database.register(Condition, conditions)
database.register(Action, actions)
database.register(Notification, notifications)

VuexORM.use(VuexORMAxios)
VuexORM.use(VuexORMWamp, { topic: IO_SOCKET_TOPIC_EXCHANGE })

export default {
  plugins: [
    VuexORM.install(database),
  ],
}
