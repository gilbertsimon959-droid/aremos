"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Bell, Search, Check, X, Edit3, Eye, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNotifications } from "@/lib/notifications"

type SortType = "mitteilung" | "name" | "classroom" | "eigene"

interface Deck {
  id: string
  name: string
  classroom: string
  hasNotification: boolean
  isOwned: boolean
  isAssigned: boolean
}

interface ContextMenu {
  show: boolean
  x: number
  y: number
  deckId: string
}

interface UserPerformance {
  id: string
  name: string
  lastVisit: string
  studyDuration: string
  answers: { round: number; card: number; correct: boolean }[]
}

export default function DecksPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showInsightsModal, setShowInsightsModal] = useState(false)
  const [selectedInsightUser, setSelectedInsightUser] = useState("1")
  const [sortBy, setSortBy] = useState<SortType>("mitteilung")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenu>({ show: false, x: 0, y: 0, deckId: "" })
  const [editingDeck, setEditingDeck] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const {
    notifications,
    readNotifications,
    showNotifications,
    setShowNotifications,
    handleNotificationHover,
    handleNotificationLeave,
    unreadCount,
  } = useNotifications()

  // =================================================================
  // DUMMY DATA FOR DEVELOPMENT/TESTING
  // TODO: Replace with actual API integration
  // =================================================================
  const userPerformanceData: UserPerformance[] = [
    {
      id: "1",
      name: "Benutzer 1",
      lastVisit: "15.12.2024",
      studyDuration: "45 Min",
      answers: [
        { round: 1, card: 1, correct: false },
        { round: 1, card: 2, correct: true },
        { round: 1, card: 3, correct: true },
        { round: 2, card: 1, correct: true },
        { round: 2, card: 2, correct: false },
        { round: 2, card: 3, correct: false },
        { round: 3, card: 1, correct: true },
        { round: 3, card: 2, correct: true },
        { round: 3, card: 3, correct: false },
        { round: 4, card: 1, correct: true },
        { round: 4, card: 2, correct: false },
        { round: 4, card: 3, correct: true },
        { round: 5, card: 1, correct: true },
        { round: 5, card: 2, correct: true },
        { round: 5, card: 3, correct: true },
      ],
    },
    ...Array.from({ length: 15 }, (_, i) => ({
      id: (i + 2).toString(),
      name: `Benutzer ${i + 2}`,
      lastVisit: "14.12.2024",
      studyDuration: `${30 + i * 5} Min`,
      answers: Array.from({ length: 21 }, (_, j) => ({
        round: Math.floor(j / 3) + 1,
        card: (j % 3) + 1,
        correct: Math.random() > 0.4,
      })),
    })),
  ]

  // DUMMY DECKS DATA - Replace with API integration
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: "1",
      name: "THEMA 1 STAPEL 2",
      classroom: "CLASSROOM 1",
      hasNotification: false,
      isOwned: true,
      isAssigned: true,
    },
    {
      id: "2", 
      name: "THEMA 3 STAPEL 1",
      classroom: "CLASSROOM 2",
      hasNotification: true,
      isOwned: true,
      isAssigned: true,
    },
    {
      id: "3",
      name: "THEMA 1 STAPEL 3",
      classroom: "CLASSROOM 3",
      hasNotification: false,
      isOwned: true,
      isAssigned: false,
    },
    {
      id: "4",
      name: "THEMA 3 STAPEL 2",
      classroom: "CLASSROOM 4",
      hasNotification: true,
      isOwned: false,
      isAssigned: true,
    },
    {
      id: "5",
      name: "THEMA 2 STAPEL 2",
      classroom: "CLASSROOM 5",
      hasNotification: false,
      isOwned: true,
      isAssigned: true,
    },
    {
      id: "6",
      name: "THEMA 1 STAPEL 1",
      classroom: "CLASSROOM 6",
      hasNotification: false,
      isOwned: true,
      isAssigned: false,
    },
    {
      id: "7",
      name: "THEMA 3 STAPEL 3",
      classroom: "CLASSROOM 7",
      hasNotification: true,
      isOwned: false,
      isAssigned: false,
    },
    {
      id: "8",
      name: "THEMA 2 STAPEL 1",
      classroom: "CLASSROOM 8",
      hasNotification: false,
      isOwned: true,
      isAssigned: true,
    },
    {
      id: "9",
      name: "THEMA 4 STAPEL 1",
      classroom: "CLASSROOM 9",
      hasNotification: true,
      isOwned: false,
      isAssigned: true,
    },
    {
      id: "10",
      name: "THEMA 1 STAPEL 4",
      classroom: "CLASSROOM 10",
      hasNotification: false,
      isOwned: true,
      isAssigned: false,
    },
  ])
  
  const [loading, setLoading] = useState(false) // Set to true when implementing API
  // =================================================================

  const handleLogout = () => {
    setShowProfileModal(false)
    router.push("/")
  }

  const handleDeleteProfile = () => {
    setShowProfileModal(false)
    router.push("/")
  }

  const handleLogoClick = () => {
    router.push("/dashboard")
  }

  const handleDeckClick = (deckId: string) => {
    router.push(`/decks/${deckId}/practice?from=${pathname}`)
  }

  const handleDeckRightClick = (e: React.MouseEvent, deckId: string) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      deckId: deckId,
    })
  }

  const handleRename = (deckId: string) => {
    const deck = decks.find((d) => d.id === deckId)
    if (deck) {
      setEditingDeck(deckId)
      setEditingName(deck.name)
      setContextMenu({ show: false, x: 0, y: 0, deckId: "" })
    }
  }

  const handleEdit = (deckId: string) => {
    console.log("[v0] Opening deck editor for:", deckId)
    setContextMenu({ show: false, x: 0, y: 0, deckId: "" })
    router.push(`/decks/${deckId}/edit`)
  }

  const handleView = (deckId: string) => {
    setShowInsightsModal(true)
    setSelectedInsightUser("1")
    setContextMenu({ show: false, x: 0, y: 0, deckId: "" })
  }

  const handleDelete = (deckId: string) => {
    setDecks(decks.filter((d) => d.id !== deckId))
    setContextMenu({ show: false, x: 0, y: 0, deckId: "" })
  }

  const handleRenameSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && editingDeck) {
      setDecks(decks.map((d) => (d.id === editingDeck ? { ...d, name: editingName } : d)))
      setEditingDeck(null)
      setEditingName("")
    }
  }

  const handleRenameBlur = () => {
    if (editingDeck) {
      setDecks(decks.map((d) => (d.id === editingDeck ? { ...d, name: editingName } : d)))
      setEditingDeck(null)
      setEditingName("")
    }
  }

  const handlePageClick = () => {
    if (contextMenu.show) {
      setContextMenu({ show: false, x: 0, y: 0, deckId: "" })
    }
  }

  const selectedDeck = decks.find((d) => d.id === contextMenu.deckId)
  const selectedUserData = userPerformanceData.find((u) => u.id === selectedInsightUser)

  const generatePerformanceGrid = (answers: { round: number; card: number; correct: boolean }[]) => {
    const maxRounds = 7
    const maxCards = 15
    const grid: (boolean | null)[][] = Array.from({ length: maxRounds }, () => Array(maxCards).fill(null))

    answers.forEach(({ round, card, correct }) => {
      if (round <= maxRounds && card <= maxCards) {
        grid[round - 1][card - 1] = correct
      }
    })

    return grid
  }

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
    setSortBy("mitteilung")
  }

  const handleSearchBlur = () => {
    if (!searchTerm) {
      setIsSearchFocused(false)
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url(/images/app-background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
      onClick={handlePageClick}
    >
      <header
        className="pt-4"
        style={{
          backgroundImage: "url(/images/app-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center flex-1 justify-start">
              <div className="flex items-center space-x-12">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 hover:bg-slate-100/20 rounded-full transition-colors relative"
                    style={{ color: "#121A4C" }}
                  >
                    <Bell className="w-7 h-7" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Benachrichtigungen</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b last:border-b-0 hover:bg-slate-50 ${
                              readNotifications.has(notification.id) ? "opacity-60" : ""
                            }`}
                            onMouseEnter={() => handleNotificationHover(notification.id)}
                            onMouseLeave={() => handleNotificationLeave(notification.id)}
                          >
                            <p className="text-sm text-slate-800 mb-1">{notification.message}</p>
                            <p className="text-xs text-slate-500">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/classrooms"
                  className="font-bold text-lg transition-colors hover:opacity-80"
                  style={{ color: "#121A4C" }}
                >
                  Meine Classrooms
                </Link>
                <Link
                  href="/decks"
                  className="font-bold text-lg transition-colors hover:opacity-80"
                  style={{ color: "#121A4C" }}
                >
                  Meine Decks
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center flex-1">
              <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity">
                <Image src="/images/aremos-logo.png" alt="AREMOS" width={78} height={78} className="w-20 h-20" />
              </button>
            </div>

            <div className="flex items-center flex-1 justify-end">
              <div className="flex items-center space-x-12">
                <Link
                  href="/decks/create"
                  className="font-bold text-lg transition-colors hover:opacity-80"
                  style={{ color: "#121A4C" }}
                >
                  Deck erstellen
                </Link>
                <Link
                  href="/classrooms/1/admin"
                  className="font-bold text-lg transition-colors hover:opacity-80"
                  style={{ color: "#121A4C" }}
                >
                  Classroom erstellen
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileModal(!showProfileModal)}
                    className="p-2 hover:bg-slate-100/20 rounded-full transition-colors"
                    style={{ color: "#121A4C" }}
                  >
                    <User className="w-7 h-7" />
                  </button>

                  {showProfileModal && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Profiloptionen</h3>
                        <button
                          onClick={() => setShowProfileModal(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 space-y-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left p-3 hover:bg-slate-50 rounded transition-colors text-slate-800"
                        >
                          Ausloggen
                        </button>
                        <button
                          onClick={handleDeleteProfile}
                          className="w-full text-left p-3 hover:bg-slate-50 rounded transition-colors text-slate-800"
                        >
                          Profil löschen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ color: "#121A4C" }}>
          MEINE DECKS
        </h1>

        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant={sortBy === "mitteilung" ? "default" : "outline"}
            onClick={() => setSortBy("mitteilung")}
            className="font-bold"
            style={{
              backgroundColor: sortBy === "mitteilung" && !isSearchFocused ? "#6FA9D2" : "#121A4C",
              color: "#ECF7FB",
              borderColor: "#121A4C",
            }}
          >
            MITTEILUNG
          </Button>
          <Button
            variant={sortBy === "name" ? "default" : "outline"}
            onClick={() => setSortBy("name")}
            className="font-bold"
            style={{
              backgroundColor: sortBy === "name" && !isSearchFocused ? "#6FA9D2" : "#121A4C",
              color: "#ECF7FB",
              borderColor: "#121A4C",
            }}
          >
            NAME
          </Button>
          <Button
            variant={sortBy === "classroom" ? "default" : "outline"}
            onClick={() => setSortBy("classroom")}
            className="font-bold"
            style={{
              backgroundColor: sortBy === "classroom" && !isSearchFocused ? "#6FA9D2" : "#121A4C",
              color: "#ECF7FB",
              borderColor: "#121A4C",
            }}
          >
            CLASSROOM
          </Button>
          <Button
            variant={sortBy === "eigene" ? "default" : "outline"}
            onClick={() => setSortBy("eigene")}
            className="font-bold"
            style={{
              backgroundColor: sortBy === "eigene" && !isSearchFocused ? "#6FA9D2" : "#121A4C",
              color: "#ECF7FB",
              borderColor: "#121A4C",
            }}
          >
            EIGENE DECKS
          </Button>
          <div className="relative">
            <Input
              type="text"
              placeholder="NAMEN EINGEBEN"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="pl-4 pr-10 font-bold border-2"
              style={{
                backgroundColor: isSearchFocused || searchTerm ? "#6FA9D2" : "#121A4C",
                color: "#ECF7FB",
                borderColor: "#121A4C",
              }}
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: "#ECF7FB" }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ border: "4px solid #121A4C" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100" style={{ borderBottom: "2px solid #121A4C" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#121A4C" }}>
                    Mitteilung
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#121A4C" }}>
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#121A4C" }}>
                    Classroom
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#121A4C" }}>
                    Eigene Decks
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          <div className="h-96 overflow-y-auto">
            <table className="w-full">
              <tbody style={{ borderColor: "#121A4C" }} className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "#121A4C" }}></div>
                        <span style={{ color: "#121A4C" }}>Lade Decks...</span>
                      </div>
                    </td>
                  </tr>
                ) : decks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <span style={{ color: "#121A4C" }}>Keine Decks gefunden</span>
                    </td>
                  </tr>
                ) : decks
                  .filter((deck) => {
                    if (searchTerm) {
                      return deck.name.toLowerCase().includes(searchTerm.toLowerCase())
                    }
                    if (sortBy === "eigene") {
                      return deck.isOwned
                    }
                    return true
                  })
                  .sort((a, b) => {
                    switch (sortBy) {
                      case "mitteilung":
                        if (a.hasNotification && !b.hasNotification) return -1
                        if (!a.hasNotification && b.hasNotification) return 1
                        return a.name.localeCompare(b.name)
                      case "name":
                        return a.name.localeCompare(b.name)
                      case "classroom":
                        return a.classroom.localeCompare(b.classroom)
                      case "eigene":
                        return a.name.localeCompare(b.name)
                      default:
                        return 0
                    }
                  })
                  .map((deck, index) => (
                    <tr
                      key={deck.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                      style={{ borderColor: "#121A4C" }}
                    >
                      <td className="px-6 py-4">
                        {deck.hasNotification && (
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#6FA9D2" }}></div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingDeck === deck.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={handleRenameSubmit}
                            onBlur={handleRenameBlur}
                            className="font-medium bg-transparent focus:outline-none"
                            style={{ color: "#121A4C", borderBottom: "2px solid #121A4C" }}
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => handleDeckClick(deck.id)}
                            onContextMenu={(e) => handleDeckRightClick(e, deck.id)}
                            className="hover:opacity-80 font-medium text-left"
                            style={{ color: "#121A4C" }}
                          >
                            {deck.name}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4" style={{ color: "#121A4C" }}>
                        {deck.classroom}
                      </td>
                      <td className="px-6 py-4">
                        {deck.isOwned ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {contextMenu.show && selectedDeck && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleRename(contextMenu.deckId)}
            className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
          >
            <Edit3 className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Umbenennen</span>
          </button>

          {selectedDeck.isOwned && (
            <>
              <button
                onClick={() => handleEdit(contextMenu.deckId)}
                className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
              >
                <Edit3 className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Bearbeiten</span>
              </button>

              <button
                onClick={() => handleView(contextMenu.deckId)}
                className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
              >
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Einsehen</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleDelete(contextMenu.deckId)}
            className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span className="text-red-700">Löschen</span>
          </button>
        </div>
      )}

      {showInsightsModal && selectedUserData && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="rounded-lg max-w-6xl w-full mx-4 h-5/6 relative overflow-hidden shadow-2xl border-4"
            style={{ backgroundColor: "#4176A4", borderColor: "#121A4C" }}
          >
            <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: "#121A4C" }}>
              <h3 className="font-bold text-xl" style={{ color: "#ECF7FB" }}>
                EINSICHT
              </h3>
              <h2 className="text-xl font-bold" style={{ color: "#ECF7FB" }}>
                LERNDATEN VON {selectedUserData.name.toUpperCase()}
              </h2>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="hover:opacity-80 text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center border-2"
                style={{ color: "#121A4C", backgroundColor: "#ECF7FB", borderColor: "#121A4C" }}
              >
                ×
              </button>
            </div>

            <div className="flex h-full">
              <div
                className="w-64 border-r-2 flex flex-col"
                style={{ backgroundColor: "#98B7D4", borderColor: "#121A4C" }}
              >
                <div className="flex-1 overflow-y-auto p-4 pr-2">
                  <div className="space-y-2">
                    {userPerformanceData.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedInsightUser(user.id)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors font-medium ${
                          selectedInsightUser === user.id ? "text-white" : "hover:opacity-80"
                        }`}
                        style={{
                          backgroundColor: selectedInsightUser === user.id ? "#121A4C" : "transparent",
                          color: selectedInsightUser === user.id ? "#ECF7FB" : "#121A4C",
                        }}
                      >
                        {user.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: "#ECF7FB" }}>
                <div className="flex space-x-6 mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-lg" style={{ color: "#121A4C" }}>
                      Letzter Besuch:
                    </span>
                    <div
                      className="px-6 py-2 rounded-full border-2"
                      style={{ backgroundColor: "white", borderColor: "#121A4C" }}
                    >
                      <span className="font-bold text-sm" style={{ color: "#121A4C" }}>
                        {selectedUserData.lastVisit}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-lg" style={{ color: "#121A4C" }}>
                      Lerndauer:
                    </span>
                    <div
                      className="px-6 py-2 rounded-full border-2"
                      style={{ backgroundColor: "white", borderColor: "#121A4C" }}
                    >
                      <span className="font-bold text-sm" style={{ color: "#121A4C" }}>
                        {selectedUserData.studyDuration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-6 border-4" style={{ backgroundColor: "#ECF7FB", borderColor: "white" }}>
                  <div
                    className="rounded-lg p-6 border-4 overflow-x-auto"
                    style={{
                      backgroundColor: "#121A4C",
                      borderColor: "white",
                      scrollbarWidth: "thin",
                      scrollbarColor: "#6FA9D2 #121A4C",
                    }}
                  >
                    <style jsx>{`
                      div::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                      }
                      div::-webkit-scrollbar-track {
                        background: #121A4C;
                      }
                      div::-webkit-scrollbar-thumb {
                        background: #6FA9D2;
                        border-radius: 4px;
                      }
                      div::-webkit-scrollbar-thumb:hover {
                        background: #4176A4;
                      }
                    `}</style>
                    <div className="min-w-max" style={{ width: "800px" }}>
                      <div className="space-y-2">
                        {generatePerformanceGrid(selectedUserData.answers)
                          .reverse()
                          .map((row, roundIndex) => (
                            <div key={roundIndex} className="flex items-center space-x-4">
                              <div className="text-lg font-bold w-8" style={{ color: "#ECF7FB" }}>
                                R{7 - roundIndex}
                              </div>
                              <div className="flex space-x-3">
                                {Array.from({ length: 15 }, (_, cardIndex) => (
                                  <div key={cardIndex} className="w-10 h-10 flex items-center justify-center">
                                    {cardIndex < 12 && row[cardIndex] === true && (
                                      <Check className="w-6 h-6 text-green-400" />
                                    )}
                                    {cardIndex < 12 && row[cardIndex] === false && (
                                      <X className="w-6 h-6 text-red-400" />
                                    )}
                                    {cardIndex >= 12 && Math.random() > 0.5 && (
                                      <Check className="w-6 h-6 text-green-400" />
                                    )}
                                    {cardIndex >= 12 && Math.random() <= 0.5 && <X className="w-6 h-6 text-red-400" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="flex items-center space-x-4 mt-4">
                        <div className="w-8"></div>
                        <div className="flex space-x-3">
                          {Array.from({ length: 15 }, (_, i) => (
                            <div key={i} className="text-sm text-center w-10" style={{ color: "#ECF7FB" }}>
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}