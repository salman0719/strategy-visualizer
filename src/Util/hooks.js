import { useCallback, useEffect, useRef, useState } from 'react'
import { ROOT_BRANCH } from './constants'
import { getUniqueID } from './getUniqueId'

export const useCopyControl = ({ item: rootItem, copy }) => {
  const [activeBranch, setActiveBranch] = useState(null)
  const [createdCopyCount, setCreatedCopyCount] = useState(0)
  const [copiedItems, setCopiedItems] = useState([])
  const branchCountObj = useRef({})

  useEffect(() => {
    const listener = (e) => {
      if (!activeBranch) { return null }
      if (e.ctrlKey === true) {
        if (e.keyCode === 65) {
          // Pressing "ctrl + a"
          let newPuzzleItem
          if (activeBranch === ROOT_BRANCH) {
            newPuzzleItem = copy(rootItem)
          } else {
            let copyItem = copiedItems.find((item) => {
              return item.stateIdentifier === activeBranch
            })
            if (!copyItem) { return }

            newPuzzleItem = copy(copyItem.puzzleItem)
          }

          const newItem = { puzzleItem: newPuzzleItem }
          const copyNumber = (branchCountObj.current[activeBranch] =
            (branchCountObj.current[activeBranch] || 0) + 1)
          newItem.stateIdentifier = activeBranch + '-' + copyNumber
          setCopiedItems([...copiedItems, newItem])
          setCreatedCopyCount(createdCopyCount + 1)
        } else if (
          e.keyCode === 88 &&
          copiedItems.length &&
          activeBranch &&
          activeBranch != '1'
        ) {
          // Pressing "ctrl + x"
          setCopiedItems(copiedItems.filter((item) => {
            return !item.stateIdentifier.startsWith(activeBranch)
          }))
          setActiveBranch(null)
          setCreatedCopyCount(createdCopyCount - 1)
        } else {
          return
        }

        e.preventDefault()
      }
    }
    window.addEventListener('keydown', listener)

    return () => {
      window.removeEventListener('keydown', listener)
    }
  }, [copiedItems, createdCopyCount, activeBranch])

  const reset = useCallback(() => {
    setActiveBranch(null)
    setCreatedCopyCount(0)
    setCopiedItems([])
    branchCountObj.current = {}
  }, [])

  return {
    activeBranch,
    copiedItems,
    set: {
      activeBranch: setActiveBranch,
      copiedItems: setCopiedItems
    },
    reset
  }
}

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    return () => {
      document.title = prevTitle
    }
  }, [])
}

export const useForceUpdate = () => {
  const set = useState()[1]
  return () => {
    set(getUniqueID())
  }
}