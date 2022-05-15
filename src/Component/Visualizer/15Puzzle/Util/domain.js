export function getPreconditions(predicates) {
  return {
    moveRight: (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                    (adjacentr ?from ?emp) (at ?t ?from) (empty ?emp))
      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentr.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    moveLeft: (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                    (adjacentl ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentl.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    moveUp: (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                  (adjacentu ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentu.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    moveDown: (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                    (adjacentd ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentd.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    }
  }
}

export function getActions(predicates) {
  const preconditions = getPreconditions(predicates)

  return {
    moveUp: function (t, from, emp) {
      if (preconditions.moveUp.apply(null, arguments)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        return true
      }
      return false
    },
    moveDown: function (t, from, emp) {
      if (preconditions.moveDown.apply(null, arguments)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        return true
      }
      return false
    },
    moveLeft: function (t, from, emp) {
      if (preconditions.moveLeft.apply(null, arguments)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        return true
      }

      return false
    },
    moveRight: function (t, from, emp) {
      if (preconditions.moveRight.apply(null, arguments)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        return true
      }
      return false
    },
  }
}