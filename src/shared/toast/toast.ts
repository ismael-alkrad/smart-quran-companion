import { h } from 'vue'
import { toast as frappeToast } from 'frappe-ui'
import BaseToast, {
  type BaseToastTone,
} from '@/shared/components/BaseToast.vue'

export interface SqcToastOptions {
  id?: string | number
  duration?: number
  dismissible?: boolean
}

type SqcToastId = ReturnType<typeof frappeToast.custom>

const toastContainerClass =
  '!h-auto !w-[342px] !items-stretch !rounded-none !bg-transparent !p-0 !shadow-none after:!bg-transparent'

function show(
  tone: BaseToastTone,
  message: string,
  options: SqcToastOptions = {},
): SqcToastId {
  let toastId: SqcToastId

  toastId = frappeToast.custom(
    () =>
      h(BaseToast, {
        message,
        tone,
        dismissible: options.dismissible ?? true,
        onClose: () => frappeToast.dismiss(toastId),
      }),
    {
      id: options.id,
      duration: options.duration,
      dismissible: options.dismissible ?? true,
      closeButton: false,
      class: toastContainerClass,
    },
  )

  return toastId
}

export const sqcToast = {
  success: (message: string, options?: SqcToastOptions) =>
    show('success', message, options),
  info: (message: string, options?: SqcToastOptions) =>
    show('info', message, options),
  warning: (message: string, options?: SqcToastOptions) =>
    show('warning', message, options),
  error: (message: string, options?: SqcToastOptions) =>
    show('error', message, options),
  dismiss: (id?: string | number) => frappeToast.dismiss(id),
}
