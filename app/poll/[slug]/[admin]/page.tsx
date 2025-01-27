"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft, Trash } from "lucide-react"

export default function AdminPage({
  params,
}: {
  params: Promise<{ slug: string, admin: string }>
}) {
  const [slug, setSlug] = useState<string | null>(null)
  const [adminId, setAdminId] = useState<string | null>(null)
  const [pollData, setPollData] = useState<any>(null)
  const [results, setResults] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    async function fetchParams() {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setAdminId(resolvedParams.admin)
    }

    fetchParams()
  }, [params])

  useEffect(() => {
    if (slug && adminId) {
      async function fetchPollData() {
        const response = await fetch('/api/quick-poll/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pollID: slug, adminID: adminId }),
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
  }, [slug, adminId])

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

  const handleDeletePoll = async () => {
    if (slug && adminId) {
      const response = await fetch('/api/quick-poll/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollID: slug, adminID: adminId }),
      })

      if (response.ok) {
        console.log("Poll deleted successfully")
        // Redirect or update UI accordingly
      } else {
        console.error('Failed to delete poll')
      }
    }
  }

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0)

  if (!pollData) {
    return <div>Loading...</div>
  }

  const isPollEnded = timeLeft !== null && timeLeft <= 0

  return (
    <div className="container mx-auto p-4">
      <div className="w-full max-w-md mx-auto shadow-md rounded-lg p-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold">{pollData.description}</h1>
          <p className="text-gray-600">Poll results and management</p>
        </div>
        <div className="mb-4">
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
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              )
            })}
            <p className="text-sm text-muted-foreground mt-4">Total votes: {totalVotes}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="destructive" onClick={handleDeletePoll} className="flex items-center gap-2">
            <Trash className="w-4 h-4" />
            Delete Poll
          </Button>
        </div>
        {timeLeft !== null && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isPollEnded ? "Poll has ended" : `Time left: ${formatTimeLeft(timeLeft)}`}
          </div>
        )}
      </div>
    </div>
  )
}