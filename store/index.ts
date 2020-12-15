import VuexORM, { Database } from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import VuexORMWamp from '@fastybird/vuex-orm-wamp'

import { IO_SOCKET_TOPIC_EXCHANGE } from '~/configuration'

// Auth node
import Account from '~/models/auth-module/accounts/Account'
import accounts from '~/models/auth-module/accounts'
import Email from '~/models/auth-module/emails/Email'
import emails from '~/models/auth-module/emails'
import Identity from '~/models/auth-module/identities/Identity'
import identities from '~/models/auth-module/identities'

// Devices node
import Device from '~/models/devices-module/devices/Device'
import devices from '~/models/devices-module/devices'
import Hardware from '~/models/devices-module/hardwares/Hardware'
import Firmware from '~/models/devices-module/firmwares/Firmware'
import DeviceProperty from '~/models/devices-module/device-properties/DeviceProperty'
import deviceProperties from '~/models/devices-module/device-properties'
import DeviceConfiguration from '~/models/devices-module/device-configuration/DeviceConfiguration'
import Channel from '~/models/devices-module/channels/Channel'
import channels from '~/models/devices-module/channels'
import ChannelProperty from '~/models/devices-module/channel-properties/ChannelProperty'
import channelProperties from '~/models/devices-module/channel-properties'
import ChannelConfiguration from '~/models/devices-module/channel-configuration/ChannelConfiguration'

// Triggers node
import Trigger from '~/models/triggers-module/triggers/Trigger'
import triggers from '~/models/triggers-module/triggers'
import Condition from '~/models/triggers-module/conditions/Condition'
import conditions from '~/models/triggers-module/conditions'
import Action from '~/models/triggers-module/actions/Action'
import actions from '~/models/triggers-module/actions'
import Notification from '~/models/triggers-module/notifications/Notification'
import notifications from '~/models/triggers-module/notifications'

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
