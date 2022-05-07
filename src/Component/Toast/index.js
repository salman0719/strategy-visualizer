import ToastProvider from './ToastProvider'

export { ToastProvider }

export default {
  success: () => {
    console.warn('`toast.success()` not yet constructed!')
  },
  error: () => {
    console.warn('`toast.error()` not yet constructed!')
  },
  warning: () => {
    console.warn('`toast.warning()` not yet constructed!')
  },
  info: () => {
    console.warn('`toast.info()` not yet constructed!')
  },
  remove: () => {
    console.warn('`toast.remove()` not yet constructed!')
  },
  clear: () => {
    console.warn('`toast.clear()` not yet constructed!')
  }
}
