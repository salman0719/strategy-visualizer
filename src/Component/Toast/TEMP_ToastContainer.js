import React, { useContext, useEffect, useRef } from 'react'
import { Toast } from 'react-bootstrap'

import ToastContext from './ToastContext'

const DEFAULT_TOAST_DELAY = 5000

const Temp = (props) => {
  const { id, title, options, hideToast, show, type, message } = props
  const delay = 'delay' in options ? options.delay : DEFAULT_TOAST_DELAY
  const autohide = 'autohide' in options ? options.autohide : true
  const ref = useRef(null)

  useEffect(() => {
    if (autohide && delay) {
      setTimeout(() => {
        if (ref.current) {
          hideToast(id)
        }
      }, delay)
    }
  }, [])

  return (
    <Toast
      ref={ref}
      autohide={autohide} // default
      delay={delay} // default
      {...options}
      onClose={hideToast.bind(null, id)}
      // onClose={}
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
}

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
          <Temp
            key={id}
            title={title}
            options={options}
            hideToast={hideToast}
            show={show}
            type={type}
            message={message}
          />
        )
      })}
    </div>
  )
}

export default ToastContainer
