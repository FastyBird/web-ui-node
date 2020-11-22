import { TJsonaModel } from 'jsona/lib/JsonaTypes'

import { TriggerEntityTypes } from '~/models/triggers-node/triggers/types'
import { ActionEntityTypes } from '~/models/triggers-node/actions/types'
import { ConditionEntityTypes } from '~/models/triggers-node/conditions/types'
import { NotificationEntityTypes } from '~/models/triggers-node/notifications/types'

export enum ConditionOperatorTypes {
  STATE_VALUE_EQUAL = 'eq',
  STATE_VALUE_ABOVE = 'above',
  STATE_VALUE_BELOW = 'below',
}

export interface TriggerJsonModelInterface extends TJsonaModel {
  id: string
  type: TriggerEntityTypes
}

export interface ActionJsonModelInterface extends TJsonaModel {
  id: string
  type: ActionEntityTypes
}

export interface ConditionJsonModelInterface extends TJsonaModel {
  id: string
  type: ConditionEntityTypes
}

export interface NotificationJsonModelInterface extends TJsonaModel {
  id: string
  type: NotificationEntityTypes
}

export interface RelationInterface extends TJsonaModel {
  id: string
  type: TriggerEntityTypes | ActionEntityTypes | NotificationEntityTypes | ConditionEntityTypes
}

export const ModuleOriginType = 'com.fastybird.triggers-node'
