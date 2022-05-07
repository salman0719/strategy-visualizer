import React, { useContext } from 'react'
import { Toast } from 'react-bootstrap'

import ToastContext from './ToastContext'

const DEFAULT_TOAST_DELAY = 5000

const ToastContainer = () => {
  const { toasts, hideToast } = useContext(ToastContext)

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const { id, type, show, message, options } = toast

        let title = toast.title
        if (!title) {
          title = type.charAt(0).toUpperCase() + type.substring(1)
        }

        return (
          <Toast
            key={id}
            autohide // default
            delay={DEFAULT_TOAST_DELAY} // default
            {...options}
            onClose={hideToast.bind(null, id)}
            bsPrefix={
              'toast custom-toast ' +
              (show ? 'toast-show' : 'toast-hide') +
              ' ' +
              type
            }
            animation={false} // forced, custom animation will be applied
          >
            {title && (
              <Toast.Header>
                {typeof title === 'string' ? (
                  <strong className="mr-auto">{title}</strong>
                ) : (
                  title
                )}
              </Toast.Header>
            )}
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        )
      })}
    </div>
  )
}

export default ToastContainer
