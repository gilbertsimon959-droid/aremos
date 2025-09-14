"use client"

import { useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Flashcard {
  id: number
  question: string
  answer: string
  attachment?: string
}

// Sample flashcard data
const sampleCards: Flashcard[] = [
  {
    id: 1,
    question: "Was ist die Hauptstadt von Deutschland?",
    answer: "Berlin ist die Hauptstadt von Deutschland.",
  },
  {
    id: 2,
    question: "Wie lautet die Formel für die Fläche eines Kreises?",
    answer: "A = π × r²",
  },
  {
    id: 3,
    question: "Wer schrieb das Werk 'Faust'?",
    answer: "Johann Wolfgang von Goethe schrieb 'Faust'.",
  },
]

export default function DeckPracticePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const currentCard = sampleCards[currentCardIndex]
  const fromPath = searchParams.get("from")

  const handleReveal = () => {
    setShowAnswer(true)
  }
  
  const handleAnswer = (isCorrect: boolean) => {
    console.log(`[v0] User answered: ${isCorrect ? "Correct" : "Wrong"}`)

    if (currentCardIndex < sampleCards.length - 1) {
      // Move to next card
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    } else {
      // End of deck - go to completion page
      const completionUrl = `/decks/${resolvedParams.id}/complete${fromPath ? `?from=${fromPath}` : ""}`
      router.push(completionUrl)
    }
  }

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
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
    >
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="flex flex-col items-center space-y-12">
          {/* Progress Indicator */}
          <div className="text-slate-600 font-medium text-2xl">
            Karte {currentCardIndex + 1} von {sampleCards.length}
          </div>

          {/* Flashcard Content */}
          <div className="w-full max-w-5xl bg-gradient-to-br from-blue-200 to-blue-300 rounded-3xl border-6 border-slate-800 p-20 min-h-[500px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-800 text-3xl leading-relaxed">
                {showAnswer ? currentCard.answer : currentCard.question}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex space-x-6">
            {!showAnswer ? (
              <Button
                onClick={handleReveal}
                className="bg-slate-800 hover:bg-slate-700 text-white px-16 py-6 text-2xl font-semibold rounded-full"
              >
                AUFDECKEN
              </Button>
            ) : (
              <div className="flex space-x-8">
                <Button
                  onClick={() => handleAnswer(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-14 py-6 text-2xl font-semibold rounded-full"
                >
                  FALSCH
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-14 py-6 text-2xl font-semibold rounded-full"
                >
                  RICHTIG
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}