export default function isSwitchingSoldiersSolved(puzzleItem) {
  const { leftPersons, rightPersons, boxes } = puzzleItem

  let boxIndex = 0, isSolved = true
  for (let person of rightPersons) {
    if (person.boxId !== boxes[boxIndex].id) {
      isSolved = false
      break
    }
    boxIndex++
  }

  if (!isSolved) { return false }

  boxIndex = boxes.length - leftPersons.length
  for (let person of leftPersons) {
    if (person.boxId !== boxes[boxIndex].id) {
      isSolved = false
      break
    }
    boxIndex++
  }

  return isSolved
}