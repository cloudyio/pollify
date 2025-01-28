"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft, Trash, Edit, PlusCircle, X } from "lucide-react"
import { Spinner } from "@/components/ui/spinner" // Import Spinner component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface PollOption {
  text: string;
  votes: number;
}

interface PollData {
  description: string;
  options: Record<string, PollOption>;
  expiresAt: string;
}

export default function AdminPage({
  params,
}: {
  params: Promise<{ slug: string, admin: string }>
}) {
  const [slug, setSlug] = useState<string | null>(null)
  const [adminId, setAdminId] = useState<string | null>(null)
  const [pollData, setPollData] = useState<PollData | null>(null)
  const [results, setResults] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [unauthorized, setUnauthorized] = useState<boolean>(false)
  const [isDeleted, setIsDeleted] = useState<boolean>(false)
  const [pollNotFound, setPollNotFound] = useState<boolean>(false)
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
  const [question, setQuestion] = useState<string>("")
  const [options, setOptions] = useState<string[]>([""])

  useEffect(() => {
    async function fetchParams() {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setAdminId(resolvedParams.admin)
    }

    fetchParams()
  }, [params])

  const fetchPollData = async () => {
    if (slug && adminId) {
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
        setQuestion(data.poll.description)
        setOptions(Object.values(data.poll.options).map((option) => (option as PollOption).text))
        const endTime = new Date(data.poll.expiresAt).getTime()
        setTimeLeft(endTime - Date.now())
        setResults(data.poll.results || {})
      } else if (response.status === 401) {
        setUnauthorized(true)
      } else if (response.status === 404) {
        setPollNotFound(true)
      } else {
        console.error('Failed to fetch poll data')
      }
    }
  }

  useEffect(() => {
    fetchPollData()
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
        setIsDeleted(true)
        console.log("Poll deleted successfully")
      } else {
        console.error('Failed to delete poll')
      }
    }
  }

  const handleEditPoll = async () => {
    if (slug && adminId) {
      const response = await fetch('/api/quick-poll/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollID: slug, adminID: adminId, description: question, options }),
      })

      if (response.ok) {
        console.log("Poll updated successfully")
        setShowEditDialog(false)
        await fetchPollData()
      } else {
        console.error('Failed to update poll')
      }
    }
  }

  const addOption = () => {
    setOptions([...options, ""])
  }

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...options]
    updatedOptions[index] = value
    setOptions(updatedOptions)
  }

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index)
    const updatedPollData: PollData = { 
      description: pollData?.description || "", 
      options: pollData?.options || {}, 
      expiresAt: pollData?.expiresAt || "" 
    }
    if (updatedPollData) {
      if (updatedPollData.options) {
        delete updatedPollData.options[index + 1]
      }
      setPollData(updatedPollData)
    }
    setOptions(updatedOptions)
  }

  const totalVotes = Object.values(pollData?.options || {}).reduce((sum, option) => sum + option.votes, 0);

  if (unauthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600">Unauthorized</p>
      </div>
    )
  }

  if (isDeleted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="">Poll deleted</p>
      </div>
    )
  }

  if (pollNotFound) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600">Poll not found</p>
      </div>
    )
  }

  if (!pollData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="w-12 h-12 text-blue-600" /> {/* Add Spinner component */}
      </div>
    )
  }

  const isPollEnded = timeLeft !== null && timeLeft <= 0

  return (
    <div className="container mx-auto p-4 mt-24">
      <div className="w-full max-w-md mx-auto shadow-md rounded-lg p-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold">{pollData.description}</h1>
          <p className="text-gray-600">Poll results and management</p>
        </div>
        <div className="mb-4">
          <div className="space-y-4">
            {Object.entries(pollData.options).map(([key, option]) => {
              const voteCount = results[key] || option.votes || 0; 
              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
              return (
                <div key={key} className="space-y-2">
                  <p>{option.text}</p>
                  <div className="flex justify-between text-sm">
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
          <Button variant="outline" onClick={() => setShowEditDialog(true)} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Poll
          </Button>
        </div>
        {timeLeft !== null && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isPollEnded ? "Poll has ended" : `Time left: ${formatTimeLeft(timeLeft)}`}
          </div>
        )}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Poll</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <span className="space-y-6">
              <span>
                <Label htmlFor="question" className="text-lg font-medium">
                  Question
                </Label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your poll question"
                  className="mt-1"
                  rows={3}
                />
              </span>

              <span className="space-y-4">
                <Label className="text-lg font-medium">Options</Label>
                {options.map((option, index) => (
                  <span key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove option</span>
                    </Button>
                  </span>
                ))}
                <Button type="button" variant="outline" onClick={addOption} className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </span>
            </span>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={handleEditPoll}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}