"use client"

import { useState, useEffect, useRef } from "react"

export interface Notification {
  id: number
  message: string
  time: string
}

const NOTIFICATIONS_KEY = "aremos_notifications"
const READ_NOTIFICATIONS_KEY = "aremos_read_notifications"

const defaultNotifications: Notification[] = [
  { id: 1, message: "Neue Lernkarten in 'Mathematik' verfügbar", time: "vor 2 Stunden" },
  { id: 2, message: "Classroom 'Deutsch 10a' wurde aktualisiert", time: "vor 1 Tag" },
  { id: 3, message: "Erinnerung: Wiederholung für 'Geschichte' fällig", time: "vor 2 Tagen" },
]

function getInitialReadNotifications(): Set<number> {
  if (typeof window === "undefined") return new Set()

  try {
    const savedReadNotifications = localStorage.getItem(READ_NOTIFICATIONS_KEY)
    if (savedReadNotifications) {
      const readIds = JSON.parse(savedReadNotifications)
      return new Set(readIds)
    }
  } catch (error) {
    console.error("Error loading read notifications:", error)
  }

  return new Set()
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications)
  const [readNotifications, setReadNotifications] = useState<Set<number>>(getInitialReadNotifications)
  const [showNotifications, setShowNotifications] = useState(false)
  const hoverTimeouts = useRef<Record<number, NodeJS.Timeout>>({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(readNotifications)))
    }
  }, [readNotifications])

  const handleNotificationHover = (notificationId: number) => {
    if (readNotifications.has(notificationId)) return

    hoverTimeouts.current[notificationId] = setTimeout(() => {
      setReadNotifications((prev) => new Set([...prev, notificationId]))
    }, 1000)
  }

  const handleNotificationLeave = (notificationId: number) => {
    if (hoverTimeouts.current[notificationId]) {
      clearTimeout(hoverTimeouts.current[notificationId])
      delete hoverTimeouts.current[notificationId]
    }
  }

  const unreadCount = notifications.length - readNotifications.size

  return {
    notifications,
    readNotifications,
    showNotifications,
    setShowNotifications,
    handleNotificationHover,
    handleNotificationLeave,
    unreadCount,
  }
}

// Helper function for creating hover handlers
export function createHoverHandlers(notificationId: number, markRead: (id: number) => void) {
  return {
    onMouseEnter: () => {
      setTimeout(() => markRead(notificationId), 1000)
    },
    onMouseLeave: () => {
      // Clear any pending timeouts if needed
    }
  }
}