import VuexORM, { Database } from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'

import Thing from '~/models/things/Thing'
import things from '~/models/things/things'

// Accounts node
import Session from '~/models/accounts-node/Session'
import sessions from '~/models/accounts-node/sessions'
import Account from '~/models/accounts-node/Account'
import accounts from '~/models/accounts-node/accounts'
import Email from '~/models/accounts-node/Email'
import emails from '~/models/accounts-node/emails'
import Identity from '~/models/accounts-node/Identity'
import identities from '~/models/accounts-node/identities'
import SecurityQuestion from '~/models/accounts-node/SecurityQuestion'
import securityQuestions from '~/models/accounts-node/security.questions'

// Triggers node
import Trigger from '~/models/triggers-node/Trigger'
import triggers from '~/models/triggers-node/triggers'
import Condition from '~/models/triggers-node/Condition'
import conditions from '~/models/triggers-node/conditions'
import Action from '~/models/triggers-node/Action'
import actions from '~/models/triggers-node/actions'
import Notification from '~/models/triggers-node/Notification'
import notifications from '~/models/triggers-node/notifications'

// Devices node
import Device from '~/models/devices-node/Device'
import devices from '~/models/devices-node/devices'
import Hardware from '~/models/devices-node/Hardware'
import Firmware from '~/models/devices-node/Firmware'
import Credentials from '~/models/devices-node/Credentials'
import DeviceProperty from '~/models/devices-node/DeviceProperty'
import DeviceConfiguration from '~/models/devices-node/DeviceConfiguration'
import Channel from '~/models/devices-node/Channel'
import channels from '~/models/devices-node/channels'
import ChannelProperty from '~/models/devices-node/ChannelProperty'
import ChannelConfiguration from '~/models/devices-node/ChannelConfiguration'
import Group from '~/models/devices-node/Group'
import groups from '~/models/devices-node/groups'

// Create new instance of Database.
const database = new Database()

database.register(Thing, things)

database.register(Session, sessions)
database.register(Account, accounts)
database.register(Email, emails)
database.register(Identity, identities)
database.register(SecurityQuestion, securityQuestions)

database.register(Trigger, triggers)
database.register(Condition, conditions)
database.register(Action, actions)
database.register(Notification, notifications)

database.register(Device, devices)
database.register(Hardware)
database.register(Firmware)
database.register(Credentials)
database.register(DeviceProperty)
database.register(DeviceConfiguration)
database.register(Channel, channels)
database.register(ChannelProperty)
database.register(ChannelConfiguration)
database.register(Group, groups)

VuexORM.use(VuexORMAxios)

export const plugins = [
  VuexORM.install(database),
]
