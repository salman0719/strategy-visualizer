// TODO
// We will generalize later!
export const templatePredicateForOne = (
  name = '',
  props = {},
  prevMap
) => {
  const { onAssert, onNegate } = props
  let eventData = null

  const map = new Map(prevMap)

  const validate = (item, fnName) => {
    if (!item) {
      throw new Error(
        `Argument of predicate '${name}'` +
        (fnName ? `, function(${fnName})` : '') +
        ` can not be empty!` +
        ` Received value -`,
        item
      )
    }
  }

  // Applies the predicate
  const response = (item) => {
    validate(item)
    onAssert && onAssert(eventData, item)
    map.set(item, true)
  }
  response.not = (item) => {
    validate(item, 'not')
    onNegate && onNegate(eventData, item)
    return map.delete(item)
  }
  response.has = (item) => {
    validate(item, 'has')
    return map.get(item) === true
  }

  response.copy = () => {
    return templatePredicateForOne(name, props, map)
  }

  response.setEventData = (data) => {
    eventData = data
  }

  // TEMP
  // Debugging purpose
  response.getAll = () => (map)

  return response
}

export const templatePredicateForTwo = (
  name = '',
  props = {},
  prevMap
) => {
  const { onAssert, onNegate } = props
  let eventData = null

  const map = (() => {
    if (prevMap) {
      const newMap = new Map(prevMap)
      // NOTE
      // When we generalize templacePredicate from templacePredicateForOne/templacePredicateForTwo
      // we will need to make sure this one is generalized as well!
      newMap.forEach((value, key) => {
        newMap.set(key, new Map(value))
      })

      return newMap
    }

    return new Map()
  })()

  const validate = (item1, item2, fnName) => {
    if (!item1) {
      throw new Error(
        `First argument of predicate '${name}'` +
        (fnName ? `, function(${fnName})` : '') +
        ` can not be empty!` +
        ` Received value -`,
        item1
      )
    }

    if (!item2) {
      throw new Error(
        `Second argument of predicate '${name}'` +
        (fnName ? `, function(${fnName})` : '') +
        ` can not be empty!` +
        ` Received value -`,
        item2
      )
    }
  }

  // Applies the predicate
  const response = (item1, item2) => {
    validate(item1, item2)

    onAssert && onAssert(eventData, item1, item2)

    let nestedMap = map.get(item1)
    if (!nestedMap) {
      nestedMap = new Map()
      map.set(item1, nestedMap)
    }

    nestedMap.set(item2, true)
  }
  response.not = (item1, item2) => {
    validate(item1, item2, 'not')

    onNegate && onNegate(eventData, item1, item2)

    let nestedMap = map.get(item1)
    if (!nestedMap) {
      return false
    }

    return nestedMap.delete(item2)
  }
  response.has = (item1, item2) => {
    validate(item1, item2, 'has')

    let nestedMap = map.get(item1)
    if (!nestedMap) {
      return false
    }

    return nestedMap.get(item2) === true
  }

  response.copy = () => {
    return templatePredicateForTwo(name, props, map)
  }

  response.setEventData = (data) => {
    eventData = data
  }

  // TEMP
  // Debugging purpose
  response.getAll = () => (map)

  return response
}
