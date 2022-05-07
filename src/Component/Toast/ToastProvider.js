import React, { useState, useEffect, useCallback } from 'react'
import ToastContainer from './ToastContainer'
import ToastContext from './ToastContext'
import toast from './index'
import { getUniqueID } from '../../Util/getUniqueId'

const transitionPeriod = 500

const defaultToast = { ...toast }

const assignToastFunctions = (showToast, hideToast) => {
  // Workaround for ease of convenience applying toast functions directly
  Object.assign(toast, {
    warning: (message, title, options) => {
      return showToast('warning', message, title, options)
    },
    error: (message, title, options) => {
      return showToast('error', message, title, options)
    },
    info: (message, title, options) => {
      return showToast('info', message, title, options)
    },
    success: (message, title, options) => {
      return showToast('success', message, title, options)
    },
    remove: (toastID) => {
      hideToast(toastID)
    },
    clear: () => {
      hideToast(true)
    }
  })
}

const cleanUpToastFunctions = () => {
  Object.assign(toast, defaultToast)
}

const processLock = (funcName, args) => {
  if (ToastProvider.locked) {
    ToastProvider.pendingRequests.push({
      args: Array.from(args),
      funcName
    })

    return false
  }

  ToastProvider.locked = true

  return true
}

// NOTE
// This should be considered a singleton component
// Shouldn't exist more than one of this component in the
// application
const ToastProvider = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    let count = ++ToastProvider.renderedComponents
    if (count > 1) {
      throw Error(
        '`ToastProvider` should be treated as a singleton component, ' +
          'should not have more than one instance in the application!'
      )
    }

    return () => {
      ToastProvider.renderedComponents--
    }
  }, [])

  const hideToast = useCallback(
    function (toastID) {
      if (!processLock('hideToast', arguments)) return false

      setToasts(
        toasts.map((toastItem) => {
          if (toastID === true || toastItem.id === toastID) {
            return {
              ...toastItem,
              show: false,
              removeTime: Date.now() + transitionPeriod
            }
          }

          return toastItem
        })
      )
    },
    [toasts]
  )

  const showToast = useCallback(
    function (
      type,
      message = '',
      title = '',
      options = {},
      id = getUniqueID()
    ) {
      if (!processLock('showToast', arguments)) return id

      const curTime = Date.now()
      let toastsUpdated = false
      // Removing toasts those have transitioned to `hide` state
      let newToasts = toasts.filter((toastItem) => {
        const { removeTime } = toastItem
        return !removeTime || curTime < removeTime
      })

      toastsUpdated = newToasts.length !== toasts.length

      if (
        options.preventDuplicates !== true ||
        !newToasts.find((toastItem) => {
          const {
            type: sndType,
            message: sndMessage = '',
            title: sndTitle = ''
          } = toastItem
          return (
            type === sndType && message === sndMessage && title === sndTitle
          )
        })
      ) {
        toastsUpdated = true
        newToasts.push({
          id,
          show: true,
          type,
          message,
          title,
          options,
          // `removeTime` => Determines the time after which it is allowed to
          // remove the toastItem from `toasts`
          removeTime: 0
        })
      }

      ToastProvider.locked = true

      if (toastsUpdated) {
        delete options.preventDuplicates
        setToasts(newToasts)
        return id
      }

      return undefined
    },
    [toasts]
  )

  useEffect(() => {
    assignToastFunctions(showToast)

    ToastProvider.locked = false

    let request = ToastProvider.pendingRequests.shift()
    if (request) {
      let { funcName, args } = request
      if (funcName === 'showToast') {
        showToast.apply(null, args)
      } else if (funcName === 'hideToast') {
        hideToast.apply(null, args)
      }
    }

    return cleanUpToastFunctions
  })

  return (
    <ToastContext.Provider
      value={{
        toasts,
        hideToast,
        showToast
      }}
    >
      <ToastContainer />
    </ToastContext.Provider>
  )
}

ToastProvider.renderedComponents = 0
ToastProvider.locked = false
ToastProvider.pendingRequests = []

export default ToastProvider
