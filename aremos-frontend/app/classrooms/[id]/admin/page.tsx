"use client"

import { useState, use } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Edit, Trash2, Users, Plus, Paperclip, Bell, User, X, Search, Eye, Check } from "lucide-react"
import { useNotifications } from "@/lib/notifications"

interface Lesson {
  id: number
  title: string
  description: string
  resources: string[]
}

interface Member {
  id: number
  name: string
}

interface Deck {
  id: number
  name: string
  selected: boolean
}

interface ResourceContextMenu {
  show: boolean
  x: number
  y: number
  resourceIndex: number
  resourceName: string
}

interface UserPerformance {
  id: string
  name: string
  lastVisit: string
  studyDuration: string
  answers: { round: number; card: number; correct: boolean }[]
}

const availableDecks: Deck[] = [
  { id: 1, name: "THEMA 1 STAPEL 2", selected: false },
  { id: 2, name: "THEMA 3 STAPEL 1", selected: true },
  { id: 3, name: "THEMA 1 STAPEL 3", selected: false },
  { id: 4, name: "THEMA 3 STAPEL 2", selected: false },
  { id: 5, name: "THEMA 2 STAPEL 2", selected: false },
  { id: 6, name: "THEMA 1 STAPEL 1", selected: false },
  { id: 7, name: "THEMA 3 STAPEL 3", selected: false },
]

const members: Member[] = [
  { id: 1, name: "Mitglied 1" },
  { id: 2, name: "Mitglied 2" },
  { id: 3, name: "Mitglied 3" },
  { id: 4, name: "Mitglied 4" },
  { id: 5, name: "Mitglied 5" },
  { id: 6, name: "Mitglied 6" },
]

const lessons: Lesson[] = [
  {
    id: 1,
    title: "Lektion 1",
    description:
      "Dies ist die Beschreibung für Lektion 1. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 1", "Stufe 1", "Stufe 1"],
  },
  {
    id: 2,
    title: "Lektion 2",
    description:
      "Dies ist die Beschreibung für Lektion 2. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 2", "Stufe 2"],
  },
  {
    id: 3,
    title: "Lektion 3",
    description:
      "Dies ist die Beschreibung für Lektion 3. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 3"],
  },
  {
    id: 4,
    title: "Lektion 4",
    description:
      "Dies ist die Beschreibung für Lektion 4. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 4", "Stufe 4", "Stufe 4", "Stufe 4"],
  },
  {
    id: 5,
    title: "Lektion 5",
    description:
      "Dies ist die Beschreibung für Lektion 5. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 5", "Stufe 5"],
  },
  {
    id: 6,
    title: "Lektion 6",
    description:
      "Dies ist die Beschreibung für Lektion 6. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: [],
  },
]

export default function TeacherClassroomView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const pathname = usePathname()
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(lessons[0])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showDeckSelectionModal, setShowDeckSelectionModal] = useState(false)
  const [isEditingClassroomName, setIsEditingClassroomName] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [classroomName, setClassroomName] = useState("NEUER CLASSROOM")
  const [editingTitle, setEditingTitle] = useState("")
  const [editingDescription, setEditingDescription] = useState("")
  const [membersList, setMembersList] = useState<Member[]>(members)
  const [newStudentName, setNewStudentName] = useState("")
  const [lessonsList, setLessonsList] = useState<Lesson[]>(lessons)
  const [decksList, setDecksList] = useState<Deck[]>(availableDecks)
  const [deckSearchQuery, setDeckSearchQuery] = useState("")
  const [resourceContextMenu, setResourceContextMenu] = useState<ResourceContextMenu>({
    show: false,
    x: 0,
    y: 0,
    resourceIndex: -1,
    resourceName: ""
  })
  const [showInsightsModal, setShowInsightsModal] = useState(false)
  const [selectedInsightUser, setSelectedInsightUser] = useState("1")

  const { notifications, unreadCount, setShowNotifications, handleNotificationHover } = useNotifications()
  const [showNotifications, setShowNotificationsState] = useState(false)

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

  const handleDeleteClassroom = () => {
    if (confirm("Sind Sie sicher, dass Sie diesen Classroom löschen möchten?")) {
      router.push("/classrooms")
    }
  }

  const handleDeleteLesson = () => {
    if (confirm("Sind Sie sicher, dass Sie diese Lektion löschen möchten?")) {
      console.log("Lektion gelöscht")
    }
  }

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: lessonsList.length + 1,
      title: `Lektion ${lessonsList.length + 1}`,
      description: `Dies ist die Beschreibung für Lektion ${lessonsList.length + 1}. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.`,
      resources: [],
    }
    setLessonsList([...lessonsList, newLesson])
  }

  const handleEditClassroomName = () => {
    setIsEditingClassroomName(true)
  }

  const handleSaveClassroomName = () => {
    setIsEditingClassroomName(false)
  }

  const handleEditTitle = () => {
    setEditingTitle(selectedLesson.title)
    setIsEditingTitle(true)
  }

  const handleSaveTitle = () => {
    setIsEditingTitle(false)
    const updatedLessons = lessonsList.map((lesson) =>
      lesson.id === selectedLesson.id ? { ...lesson, title: editingTitle } : lesson,
    )
    setLessonsList(updatedLessons)
    setSelectedLesson({ ...selectedLesson, title: editingTitle })
  }

  const handleEditDescription = () => {
    setEditingDescription(selectedLesson.description)
    setIsEditingDescription(true)
  }

  const handleSaveDescription = () => {
    setIsEditingDescription(false)
    const updatedLessons = lessonsList.map((lesson) =>
      lesson.id === selectedLesson.id ? { ...lesson, description: editingDescription } : lesson,
    )
    setLessonsList(updatedLessons)
    setSelectedLesson({ ...selectedLesson, description: editingDescription })
  }
  
  const handleResourceClick = (resource: string) => {
    router.push(`/decks/1/practice?from=${pathname}`)
  }

  const handleManageResources = () => {
    setShowDeckSelectionModal(true)
  }

  const handleRemoveResource = (resourceIndex: number) => {
    const updatedLessons = lessonsList.map((lesson) => {
      if (lesson.id === selectedLesson.id) {
        const updatedResources = lesson.resources.filter((_, index) => index !== resourceIndex)
        const updatedLesson = { ...lesson, resources: updatedResources }
        setSelectedLesson(updatedLesson)
        return updatedLesson
      }
      return lesson
    })
    setLessonsList(updatedLessons)
  }

  const handleToggleDeck = (deckId: number) => {
    const updatedDecks = decksList.map((deck) => (deck.id === deckId ? { ...deck, selected: !deck.selected } : deck))
    setDecksList(updatedDecks)
  }

  const handleAddSelectedDecks = () => {
    const selectedDecks = decksList.filter((deck) => deck.selected)
    if (selectedDecks.length > 0) {
      const updatedLessons = lessonsList.map((lesson) => {
        if (lesson.id === selectedLesson.id) {
          const newResources = selectedDecks.map((deck) => deck.name)
          const totalResources = lesson.resources.length + newResources.length
          const resourcesToAdd = totalResources > 4 ? newResources.slice(0, 4 - lesson.resources.length) : newResources

          const updatedLesson = {
            ...lesson,
            resources: [...lesson.resources, ...resourcesToAdd],
          }
          setSelectedLesson(updatedLesson)
          return updatedLesson
        }
        return lesson
      })
      setLessonsList(updatedLessons)

      const resetDecks = decksList.map((deck) => ({ ...deck, selected: false }))
      setDecksList(resetDecks)
      setDeckSearchQuery("")
      setShowDeckSelectionModal(false)
    }
  }

  const handleCloseDeckSelection = () => {
    setDeckSearchQuery("")
    setShowDeckSelectionModal(false)
  }

  const handleRemoveMember = (memberId: number) => {
    const updatedMembers = membersList.filter((member) => member.id !== memberId)
    setMembersList(updatedMembers)
  }

  const handleAddStudent = () => {
    if (newStudentName.trim() !== "") {
      const newMember: Member = { id: membersList.length + 1, name: newStudentName }
      setMembersList([...membersList, newMember])
      setNewStudentName("")
      setShowAddStudentModal(false)
    }
  }

  const handleCancelAddStudent = () => {
    setNewStudentName("")
    setShowAddStudentModal(false)
  }

  const filteredDecks = decksList.filter((deck) => deck.name.toLowerCase().includes(deckSearchQuery.toLowerCase()))

  // Dummy UserPerformance Data (wie in aremos-landing)
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

  // Resource Context Menu Handlers
  const handleResourceRightClick = (e: React.MouseEvent, resourceIndex: number, resourceName: string) => {
    e.preventDefault()
    setResourceContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      resourceIndex: resourceIndex,
      resourceName: resourceName
    })
  }

  const handleRemoveResourceFromContext = () => {
    if (resourceContextMenu.resourceIndex >= 0) {
      handleRemoveResource(resourceContextMenu.resourceIndex)
    }
    setResourceContextMenu({ show: false, x: 0, y: 0, resourceIndex: -1, resourceName: "" })
  }

  const handleViewInsightsFromContext = () => {
    setShowInsightsModal(true)
    setSelectedInsightUser("1")
    setResourceContextMenu({ show: false, x: 0, y: 0, resourceIndex: -1, resourceName: "" })
  }

  const handlePageClick = () => {
    if (resourceContextMenu.show) {
      setResourceContextMenu({ show: false, x: 0, y: 0, resourceIndex: -1, resourceName: "" })
    }
  }

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
                    onClick={() => setShowNotificationsState(!showNotifications)}
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
                            className="p-4 border-b last:border-b-0 hover:bg-slate-50"
                            onMouseEnter={() => handleNotificationHover(notification.id)}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-lg flex items-center justify-between py-4 px-6" style={{ backgroundColor: "#121A4C" }}>
          <div className="flex items-center space-x-4" style={{ marginLeft: "12px" }}>
            <button
              onClick={() => setShowMembersModal(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
              style={{ backgroundColor: "#ECF7FB" }}
              title="Mitglieder verwalten"
            >
              <Users className="w-5 h-5" style={{ color: "#121A4C" }} />
            </button>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
              style={{ backgroundColor: "#ECF7FB" }}
              title="Schüler hinzufügen"
            >
              <Plus className="w-5 h-5" style={{ color: "#121A4C" }} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isEditingClassroomName ? (
              <input
                type="text"
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
                onBlur={handleSaveClassroomName}
                onKeyDown={(e) => e.key === "Enter" && handleSaveClassroomName()}
                className="text-xl font-semibold bg-transparent border-b-2 focus:outline-none"
                style={{ borderColor: "#ECF7FB", color: "#ECF7FB" }}
                autoFocus
              />
            ) : (
              <h1 className="text-xl font-semibold" style={{ color: "#ECF7FB" }}>
                {classroomName}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-2" style={{ marginRight: "12px" }}>
            <button
              onClick={handleEditClassroomName}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
              style={{ backgroundColor: "#ECF7FB" }}
              title="Classroom Namen bearbeiten"
            >
              <Edit className="w-4 h-4" style={{ color: "#121A4C" }} />
            </button>
            <button
              onClick={handleDeleteClassroom}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
              style={{ backgroundColor: "#ECF7FB" }}
              title="Classroom löschen"
            >
              <Trash2 className="w-4 h-4" style={{ color: "#121A4C" }} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <div className="w-80 space-y-2 flex flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 400px)" }}>
              {lessonsList.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full p-4 rounded-lg text-left font-medium transition-colors border-2`}
                  style={{
                    backgroundColor: selectedLesson.id === lesson.id ? "#98B7D4" : "#ECF7FB",
                    borderColor: "#121A4C",
                    color: "#121A4C",
                  }}
                >
                  {lesson.title}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddLesson}
              className="w-full p-4 rounded-lg text-left font-medium hover:opacity-80 transition-colors flex items-center justify-center space-x-2"
              style={{ backgroundColor: "#4176A4", color: "#ECF7FB" }}
            >
              <span>Hinzufügen</span>
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <div className="rounded-lg p-6 flex items-center justify-between" style={{ backgroundColor: "#98B7D4" }}>
              <div className="flex-1">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleSaveTitle()
                      }
                    }}
                    className="text-2xl font-bold bg-transparent border-b-2 focus:outline-none w-full"
                    style={{ color: "#121A4C", borderColor: "#121A4C" }}
                    autoFocus
                  />
                ) : (
                  <h2 className="text-2xl font-bold" style={{ color: "#121A4C" }}>
                    {selectedLesson.title}
                  </h2>
                )}
              </div>
              <div className="flex items-center space-x-2" style={{ marginRight: "12px" }}>
                <button
                  onClick={handleEditTitle}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
                  style={{ backgroundColor: "#121A4C" }}
                  title="Titel bearbeiten"
                >
                  <Edit className="w-4 h-4" style={{ color: "#ECF7FB" }} />
                </button>
                <button
                  onClick={handleDeleteLesson}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
                  style={{ backgroundColor: "#121A4C" }}
                  title="Lektion löschen"
                >
                  <Trash2 className="w-4 h-4" style={{ color: "#ECF7FB" }} />
                </button>
              </div>
            </div>

            <div className="rounded-lg p-6 flex items-start justify-between" style={{ backgroundColor: "#98B7D4" }}>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4" style={{ color: "#121A4C" }}>
                  Beschreibung
                </h3>
                {isEditingDescription ? (
                  <textarea
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    onBlur={handleSaveDescription}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSaveDescription()
                      }
                    }}
                    className="w-full bg-transparent border-2 rounded p-2 focus:outline-none resize-none"
                    style={{ color: "#121A4C", borderColor: "#121A4C" }}
                    rows={3}
                    autoFocus
                  />
                ) : (
                  <p style={{ color: "#121A4C" }}>{selectedLesson.description}</p>
                )}
              </div>
              <div style={{ marginRight: "12px", marginTop: "0px" }}>
                <button
                  onClick={handleEditDescription}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
                  style={{ backgroundColor: "#121A4C" }}
                  title="Beschreibung bearbeiten"
                >
                  <Edit className="w-4 h-4" style={{ color: "#ECF7FB" }} />
                </button>
              </div>
            </div>

            <div className="rounded-lg p-6 border" style={{ backgroundColor: "#ECF7FB", borderColor: "#121A4C" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold" style={{ color: "#121A4C" }}>
                  Ressourcen
                </h3>
                <div style={{ marginRight: "12px" }}>
                  <button
                    onClick={handleManageResources}
                    disabled={selectedLesson.resources.length >= 4}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#121A4C" }}
                    title={selectedLesson.resources.length >= 4 ? "Maximum 4 Ressourcen erlaubt" : "Decks anheften"}
                  >
                    <Paperclip className="w-4 h-4" style={{ color: "#ECF7FB" }} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {selectedLesson.resources.length > 0 ? (
                  selectedLesson.resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg px-3 py-2 hover:opacity-80 transition-colors"
                      style={{ backgroundColor: "#98B7D4" }}
                    >
                      <button
                        onClick={() => handleResourceClick(resource)}
                        onContextMenu={(e) => handleResourceRightClick(e, index, resource)}
                        className="flex items-center space-x-2 hover:opacity-80 transition-colors flex-1 text-left"
                        style={{ color: "#121A4C" }}
                      >
                        <span style={{ color: "#4176A4" }}>📄</span>
                        <span>{resource}</span>
                      </button>
                      <button
                        onClick={() => handleRemoveResource(index)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
                        style={{ backgroundColor: "#121A4C" }}
                        title="Ressource entfernen"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: "#ECF7FB" }} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="italic" style={{ color: "#121A4C" }}>
                    Keine Ressourcen vorhanden
                  </p>
                )}
                <p className="text-sm mt-2" style={{ color: "#121A4C" }}>
                  {selectedLesson.resources.length}/4 Ressourcen
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMembersModal && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMembersModal(false)} />
          <div className="fixed top-24 left-16 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Mitglieder verwalten</h3>
              <button onClick={() => setShowMembersModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto p-4 space-y-2">
              {membersList.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-full px-4 py-3"
                  style={{ backgroundColor: "#6FA9D2" }}
                >
                  <span className="text-slate-800 font-medium">{member.name}</span>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                    title="Mitglied entfernen"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showAddStudentModal && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAddStudentModal(false)} />
          <div className="fixed top-24 left-28 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Schüler hinzufügen</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Namen eingeben"
                    className="w-full px-4 py-3 pr-12 bg-gray-50 rounded-lg border-2 border-gray-300 text-slate-800 placeholder-slate-600 focus:outline-none transition-all"
                    style={{ borderColor: "#6FA9D2", focusBorderColor: "#6FA9D2" }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelAddStudent}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-800 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddStudent}
                  className="flex-1 text-white font-semibold py-2 px-4 rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#6FA9D2" }}
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showDeckSelectionModal && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleCloseDeckSelection} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Eigene Decks</h3>
              <button
                onClick={handleCloseDeckSelection}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <input
                  type="text"
                  value={deckSearchQuery}
                  onChange={(e) => setDeckSearchQuery(e.target.value)}
                  placeholder="Deck-Namen eingeben..."
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                  style={{ borderColor: "#6FA9D2" }}
                  autoFocus
                />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {filteredDecks.length > 0 ? (
                  filteredDecks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => handleToggleDeck(deck.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        deck.selected ? "text-slate-800" : "hover:opacity-80 text-slate-700"
                      }`}
                      style={{ backgroundColor: deck.selected ? "#6FA9D2" : "#ECF7FB" }}
                    >
                      <div
                        className={`w-4 h-4 border-2 rounded ${
                          deck.selected ? "border-slate-800" : "border-gray-400"
                        } flex items-center justify-center`}
                        style={{ backgroundColor: deck.selected ? "#121A4C" : "transparent" }}
                      >
                        {deck.selected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                      </div>
                      <span className="font-medium">{deck.name}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Keine Decks gefunden</p>
                )}
              </div>

              <button
                onClick={handleAddSelectedDecks}
                disabled={!decksList.some((deck) => deck.selected) || selectedLesson.resources.length >= 4}
                className="w-full font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                style={{ backgroundColor: "#6FA9D2" }}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {selectedLesson.resources.length >= 4 ? "Maximum erreicht (4/4)" : "Ausgewählte Decks hinzufügen"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Resource Context Menu */}
      {resourceContextMenu.show && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          style={{
            left: resourceContextMenu.x,
            top: resourceContextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleRemoveResourceFromContext}
            className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span className="text-red-700">Entfernen</span>
          </button>
          <button
            onClick={handleViewInsightsFromContext}
            className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
          >
            <Eye className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Einsehen</span>
          </button>
        </div>
      )}

      {/* Insights Modal */}
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