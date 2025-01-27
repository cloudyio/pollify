"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft } from "lucide-react"
import { Spinner } from "@/components/ui/spinner" // Import Spinner component

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [slug, setSlug] = useState<string | null>(null)
  const [pollData, setPollData] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [results, setResults] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    async function fetchSlug() {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }

    fetchSlug()
  }, [params])

  useEffect(() => {
    if (slug) {
      async function fetchPollData() {
        const response = await fetch('/api/quick-poll/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pollID: slug }),
        })

        if (response.ok) {
          const data = await response.json()
          setPollData(data.poll)
          const endTime = new Date(data.poll.expiresAt).getTime()
          setTimeLeft(endTime - Date.now())
        } else {
          console.error('Failed to fetch poll data')
        }
      }

      fetchPollData()
    }
  }, [slug])

  useEffect(() => {
    const storedVote = localStorage.getItem(`pollVote_${slug}`)
    if (storedVote) {
      setHasVoted(true)
      setResults(JSON.parse(storedVote))
    }
  }, [slug])

  useEffect(() => {
    if (timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1000 : null))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft])

  const formatTimeLeft = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours}h ${minutes}m ${seconds}s`
  }

  const handleVote = async () => {
    if (selectedOption && slug) {
      const response = await fetch('/api/quick-poll/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollID: slug, optionID: selectedOption }),
      })

      if (response.ok) {
        const newResults = { ...results }
        newResults[selectedOption] = (newResults[selectedOption] || 0) + 1
        setResults(newResults)
        setHasVoted(true)
        localStorage.setItem(`pollVote_${slug}`, JSON.stringify(newResults))
        console.log("Vote submitted successfully")
      } else {
        console.error("Failed to submit vote")
      }
    }
  }

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0)

  if (!pollData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="w-12 h-12 text-blue-600" /> {/* Add Spinner component */}
      </div>
    )
  }

  const isPollEnded = timeLeft !== null && timeLeft <= 0

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-4rem)] ">
      <div className="w-full max-w-lg mx-auto shadow-lg rounded-lg p-8 bg-[#090b1b]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{pollData.description}</h1>
          <p className="text-gray-700">{hasVoted ? "Poll results" : "Select an option and submit your vote"}</p>
        </div>
        <div className="mb-6">
          {!hasVoted && !isPollEnded ? (
            <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption}>
              {Object.entries(pollData.options).map(([key, option]) => (
                <div key={key} className="flex items-center space-x-3 mb-2">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-4">
              {Object.entries(pollData.options).map(([key, option]) => {
                const voteCount = results[key] || 0
                const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{option.text}</span>
                      <span>
                        {voteCount} votes ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-[#4f01d5] h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
              <p className="text-sm text-gray-500 mt-4">Total votes: {totalVotes}</p>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          {!hasVoted && !isPollEnded ? (
            <Button onClick={handleVote} disabled={!selectedOption}>
              Submit Vote
            </Button>
          ) : (
            <Button variant="outline" disabled className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Vote Again
            </Button>
          )}
        </div>
        {timeLeft !== null && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {isPollEnded ? "Poll has ended" : `Time left: ${formatTimeLeft(timeLeft)}`}
          </div>
        )}
      </div>
    </div>
  )
}