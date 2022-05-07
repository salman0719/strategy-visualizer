import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_ACTIVE_BRANCH } from './constants'
import { getUniqueID } from './getUniqueId'

export const useCopyControl = ({ item: rootItem, copy }) => {
  const [activeBranch, setActiveBranch] = useState(DEFAULT_ACTIVE_BRANCH)
  const [createdCopyCount, setCreatedCopyCount] = useState(0)
  const [copiedItems, setCopiedItems] = useState([])
  const branchCountObj = useRef({})

  useEffect(() => {
    const listener = (e) => {
      if (e.ctrlKey === true) {
        if (e.keyCode === 65) {
          // Pressing "ctrl + a"
          let newItem
          if (activeBranch === DEFAULT_ACTIVE_BRANCH) {
            newItem = copy(rootItem)
          } else {
            let copyItem = copiedItems.find((item) => {
              return item.stateIdentifier === activeBranch
            })
            copyItem = { ...copyItem }
            delete copyItem.stateIdentifier

            newItem = copy(copyItem)
          }

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
    setActiveBranch(DEFAULT_ACTIVE_BRANCH)
    setCreatedCopyCount(0)
    setCopiedItems([])
    branchCountObj.current = {}
  }, [])

  return {
    activeBranch,
    copiedItems,
    set: {
      activeBranch: setActiveBranch
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