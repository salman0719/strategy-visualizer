const initialize = (personCount = DEFAULT_PERSON_COUNT) => {
  const totalLeftPerson = personCount
  const totalRightPerson = personCount
  const totalBox = personCount * 2 + 1

  leftPerson = templatePredicateForOne('leftPerson')
  rightPerson = templatePredicateForOne('rightPerson')
  ground = templatePredicateForOne('ground')
  onGround = templatePredicateForTwo('onGround')
  nextGround = templatePredicateForTwo('nextGround')
  groundClear = templatePredicateForOne('groundClear')
  leftPersonShouldJump = false
  rightPersonShouldJump = false

  leftPersons = Array(totalLeftPerson)
    .fill(0)
    .map((item, index) => {
      const id = 'left-person-' + index + '-' + getUniqueID()
      leftPerson(id)
      return { id }
    })

  rightPersons = Array(totalRightPerson)
    .fill(0)
    .map((item, index) => {
      const id = 'right-person-' + index + '-' + getUniqueID()
      rightPerson(id)
      return { id }
    })

  boxes = Array(totalBox)
    .fill(0)
    .map((item, index) => {
      const id = 'ground-' + index + '-' + getUniqueID()
      ground(id)
      return { id, index }
    })

  for (let i = boxes.length - 1; i > 0; i--) {
    nextGround(boxes[i - 1].id, boxes[i].id)
  }

  groundClear(boxes[(boxes.length - 1) / 2].id)

  leftPersons.forEach((lp, index) => {
    const box = boxes[index]
    lp.boxId = box.id
    onGround(lp.id, box.id)
  })

  rightPersons.forEach((rp, index) => {
    // TODO
    // Instead of setting `boxId`, we need to utilize the predicates only
    const box = boxes[index + (boxes.length - 1) / 2 + 1]
    rp.boxId = box.id
    onGround(rp.id, box.id)
  })
}
