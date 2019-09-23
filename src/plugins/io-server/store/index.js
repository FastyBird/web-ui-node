import VuexORM from '@vuex-orm/core'

// Profile module
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
import Channel from './modules/io-server/Channel'
import channels from './modules/io-server/channels'
import ChannelProperty from './modules/io-server/ChannelProperty'
import ChannelPropertyValue from './modules/io-server/ChannelPropertyValue'
import ChannelConfiguration from './modules/io-server/ChannelConfiguration'
import ChannelConfigurationValue from './modules/io-server/ChannelConfigurationValue'

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
const database = new VuexORM.Database()

database.register(Account, accounts)
database.register(Profile, profiles)
database.register(Email, emails)
database.register(SecurityQuestion, securityQuestions)

database.register(Thing, things)
database.register(Hardware)
database.register(Firmware)
database.register(Credentials)
database.register(ThingProperty)
database.register(ThingConfiguration)
database.register(Channel, channels)
database.register(ChannelProperty)
database.register(ChannelPropertyValue)
database.register(ChannelConfiguration)
database.register(ChannelConfigurationValue)

database.register(Trigger, triggers)
database.register(Condition, conditions)
database.register(Action, actions)
database.register(Notification, notifications)

export default VuexORM.install(database)
