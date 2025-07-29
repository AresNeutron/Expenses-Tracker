"use client"

import type React from "react"
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error" | "warning" | "info" | "confirm"
  title: string
  message: string
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-success-500" />
      case "error":
        return <AlertCircle className="w-6 h-6 text-error-500" />
      case "warning":
      case "confirm":
        return <AlertTriangle className="w-6 h-6 text-warning-500" />
      case "info":
        return <Info className="w-6 h-6 text-primary-500" />
      default:
        return <Info className="w-6 h-6 text-primary-500" />
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-success-50 dark:bg-success-900/20",
          border: "border-success-200 dark:border-success-700/50",
          text: "text-success-800 dark:text-success-200",
        }
      case "error":
        return {
          bg: "bg-error-50 dark:bg-error-900/20",
          border: "border-error-200 dark:border-error-700/50",
          text: "text-error-800 dark:text-error-200",
        }
      case "warning":
      case "confirm":
        return {
          bg: "bg-warning-50 dark:bg-warning-900/20",
          border: "border-warning-200 dark:border-warning-700/50",
          text: "text-warning-800 dark:text-warning-200",
        }
      case "info":
        return {
          bg: "bg-primary-50 dark:bg-primary-900/20",
          border: "border-primary-200 dark:border-primary-700/50",
          text: "text-primary-800 dark:text-primary-200",
        }
      default:
        return {
          bg: "bg-primary-50 dark:bg-primary-900/20",
          border: "border-primary-200 dark:border-primary-700/50",
          text: "text-primary-800 dark:text-primary-200",
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md bg-surface-primary animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-input transition-colors duration-200"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`p-4 rounded-input ${colors.bg} ${colors.border} border`}>
            <p className={`text-sm leading-relaxed ${colors.text}`}>{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border-primary flex gap-3 justify-end">
          {type === "confirm" ? (
            <>
              <button onClick={onClose} className="secondaryButton px-6 py-2">
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm?.()
                  onClose()
                }}
                className="bg-error-500 hover:bg-error-600 text-white px-6 py-2 rounded-button font-medium transition-all duration-200 shadow-card hover:shadow-card-hover"
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button onClick={onClose} className="submitButton px-6 py-2">
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageModal
