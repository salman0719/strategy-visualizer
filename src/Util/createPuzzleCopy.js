import { PREDICATE_KEY } from './constants'
import getObj from './getObj'

export default function createPuzzleCopy(data) {
  if (!(PREDICATE_KEY in data)) {
    throw new Error('No predicate information found to copy! Use `' + PREDICATE_KEY +
      '` to send predicate collection as an object.')
  }

  const response = {}
  let predicateObj = data[PREDICATE_KEY]
  const eventData = {}

  for (let key in data) {
    if (key !== PREDICATE_KEY) {
      let arr = response[key] = data[key].map((item) => ({ ...item }))
      eventData[key] = getObj(arr, 'id')
    }
  }

  const newPredicateObj = {}
  for (let key in predicateObj) {
    let obj = newPredicateObj[key] = predicateObj[key].copy()
    obj.setEventData(eventData)
  }

  response[PREDICATE_KEY] = newPredicateObj

  return response
}
