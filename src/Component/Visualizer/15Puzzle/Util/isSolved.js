export default function is15PuzzleSolved(puzzleItem) {
  const { tiles } = puzzleItem

  return !tiles.find((tile, index) => {
    return tile.boxNumber !== index + 1
  })
}