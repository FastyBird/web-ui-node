import { Database } from '@vuex-orm/core'

// Profile module
import Session from './modules/profile/Session'
import sessions from './modules/profile/sessions'
import Account from './modules/profile/Account'
import accounts from './modules/profile/accounts'
import Profile from './modules/profile/Profile'
import profiles from './modules/profile/profiles'
import Email from './modules/profile/Email'
import emails from './modules/profile/emails'
import SecurityQuestion from './modules/profile/SecurityQuestion'
import securityQuestions from './modules/profile/security.questions'

// IO server module
import Thing from './modules/io-server/Thing'
import things from './modules/io-server/things'
import Hardware from './modules/io-server/Hardware'
import Firmware from './modules/io-server/Firmware'
import Credentials from './modules/io-server/Credentials'
import ThingProperty from './modules/io-server/ThingProperty'
import ThingConfiguration from './modules/io-server/ThingConfiguration'
import thingConfiguration from './modules/io-server/thing.configuration'
import ThingSocket from './modules/io-server/ThingSocket'
import thingSockets from './modules/io-server/thing.sockets'
import Channel from './modules/io-server/Channel'
import channels from './modules/io-server/channels'
import ChannelProperty from './modules/io-server/ChannelProperty'
import ChannelPropertyValue from './modules/io-server/ChannelPropertyValue'
import channelPropertiesValues from './modules/io-server/channel.properties.values'
import ChannelConfiguration from './modules/io-server/ChannelConfiguration'
import ChannelConfigurationValue from './modules/io-server/ChannelConfigurationValue'
import channelConfigurationValues from './modules/io-server/channel.configuration.values'

// Triggers module
import Trigger from './modules/triggers/Trigger'
import triggers from './modules/triggers/triggers'
import Condition from './modules/triggers/Condition'
import conditions from './modules/triggers/conditions'
import Action from './modules/triggers/Action'
import actions from './modules/triggers/actions'
import Notification from './modules/triggers/Notification'
import notifications from './modules/triggers/notifications'

// Create new instance of Database.
const database = new Database()

database.register(Session, sessions)
database.register(Account, accounts)
database.register(Profile, profiles)
database.register(Email, emails)
database.register(SecurityQuestion, securityQuestions)

database.register(Thing, things)
database.register(Hardware)
database.register(Firmware)
database.register(Credentials)
database.register(ThingProperty)
database.register(ThingConfiguration, thingConfiguration)
database.register(ThingSocket, thingSockets)
database.register(Channel, channels)
database.register(ChannelProperty)
database.register(ChannelPropertyValue, channelPropertiesValues)
database.register(ChannelConfiguration)
database.register(ChannelConfigurationValue, channelConfigurationValues)

database.register(Trigger, triggers)
database.register(Condition, conditions)
database.register(Action, actions)
database.register(Notification, notifications)

export default database
