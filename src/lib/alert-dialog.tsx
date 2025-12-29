import * as React from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AlertDialogConfig {
  open: boolean
  title?: string
  description?: string
  onConfirm?: () => void
  onCancel?: () => void
}

interface AlertDialogContextType {
  alert: (config: Omit<AlertDialogConfig, 'open'>) => void
  close: () => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(
  null,
)

export function useAlertDialog() {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error('useAlertDialog must be used within AlertDialogProvider')
  }
  return context
}

export function AlertDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [config, setConfig] = React.useState<AlertDialogConfig>({
    open: false,
  })

  const alert = React.useCallback(
    (newConfig: Omit<AlertDialogConfig, 'open'>) => {
      setConfig({ ...newConfig, open: true })
    },
    [],
  )

  const close = React.useCallback(() => {
    setConfig((prev) => ({ ...prev, open: false }))
  }, [])

  const handleConfirm = React.useCallback(() => {
    config.onConfirm?.()
    close()
  }, [config, close])

  const handleCancel = React.useCallback(() => {
    config.onCancel?.()
    close()
  }, [config, close])

  return (
    <AlertDialogContext.Provider value={{ alert, close }}>
      {children}
      <AlertDialog open={config.open} onOpenChange={(open) => !open && close()}>
        <AlertDialogContent>
          {config.title && <AlertDialogTitle>{config.title}</AlertDialogTitle>}
          {config.description && (
            <AlertDialogDescription>
              {config.description}
            </AlertDialogDescription>
          )}
          <div className="flex gap-2 justify-center">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  )
}
