import { TJsonaModel } from 'jsona/lib/JsonaTypes'

import { TriggerEntityTypeType } from '~/models/triggers-node/triggers/types'
import { ActionEntityTypeType } from '~/models/triggers-node/actions/types'
import { ConditionEntityTypeType } from '~/models/triggers-node/conditions/types'
import { NotificationEntityTypeType } from '~/models/triggers-node/notifications/types'

export enum ConditionOperatorType {
  STATE_VALUE_EQUAL = 'eq',
  STATE_VALUE_ABOVE = 'above',
  STATE_VALUE_BELOW = 'below',
}

export interface TriggerJsonModelInterface extends TJsonaModel {
  id: string
  type: TriggerEntityTypeType
}

export interface ActionJsonModelInterface extends TJsonaModel {
  id: string
  type: ActionEntityTypeType
}

export interface ConditionJsonModelInterface extends TJsonaModel {
  id: string
  type: ConditionEntityTypeType
}

export interface NotificationJsonModelInterface extends TJsonaModel {
  id: string
  type: NotificationEntityTypeType
}

export interface RelationInterface extends TJsonaModel {
  id: string
  type: TriggerEntityTypeType | ActionEntityTypeType | NotificationEntityTypeType | ConditionEntityTypeType
}

export const ModuleOriginType = 'com.fastybird.triggers-node'
