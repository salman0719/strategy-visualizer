import { templatePredicateForOne, templatePredicateForTwo } from '../../../../Util/predicate'

export const leftPerson = templatePredicateForOne('leftPerson')
export const rightPerson = templatePredicateForOne('rightPerson')
export const ground = templatePredicateForOne('ground')
export const onGround = templatePredicateForTwo('onGround')
export const nextGround = templatePredicateForTwo('nextGround')
export const groundClear = templatePredicateForOne('groundClear')
