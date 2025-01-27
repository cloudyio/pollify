"use client"
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft } from "lucide-react"
import { Spinner } from "@/components/ui/spinner" // Import Spinner component
import { useToast } from "@/components/ui/use-toast"; // Import useToast hook

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [slug, setSlug] = useState<string | null>(null)
  interface PollOption {
    text: string;
    votes: number; // Include votes in the PollOption interface
  }

  interface PollData {
    description: string;
    options: Record<string, PollOption>;
    expiresAt: string;
  }

  const [pollData, setPollData] = useState<PollData | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [results, setResults] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    async function fetchSlug() {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }

    fetchSlug()
  }, [params])

  const fetchPollData = async () => {
    if (slug) {
      const response = await fetch('/api/quick-poll/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollID: slug }),
      });

      if (response.ok) {
        const data = await response.json();
        setPollData(data.poll);
        const endTime = new Date(data.poll.expiresAt).getTime();
        setTimeLeft(endTime - Date.now());
        setResults(data.poll.results || {}); // Set the results from the fetched data
      } else {
        console.error('Failed to fetch poll data');
      }
    }
  };

  useEffect(() => {
    fetchPollData();
  }, [slug]);

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
        setHasVoted(true)
        localStorage.setItem(`pollVote_${slug}`, JSON.stringify(results))
        console.log("Vote submitted successfully")

        // Fetch the latest poll data from the database
        await fetchPollData();
      } else {
        console.error("Failed to submit vote")
      }
    }
  }

  const handleUpdatePoll = async () => {
    if (slug && pollData) {
      const response = await fetch('/api/quick-poll/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pollID: slug,
          description: pollData.description,
          options: Object.values(pollData.options).map(option => option.text),
          duration: new Date(pollData.expiresAt).getTime() - Date.now(),
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Poll updated successfully", status: "success" });
        // Fetch the latest poll data from the database
        await fetchPollData();
      } else {
        toast({ title: "Error", description: "Failed to update poll", status: "error" });
      }
    }
  };

  const totalVotes = Object.values(pollData?.options || {}).reduce((sum, option) => sum + option.votes, 0);

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
                const voteCount = results[key] || option.votes || 0; // Use option.votes if results are not available
                const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
                return (
                  <div key={key} className="space-y-2">
                    <p>{option.text}</p>
                    <div className="flex justify-between text-sm">
                      <span>
                        {voteCount} votes ({percentage.toFixed(1)}%)
                      </span>
                      {key === selectedOption && <span className="text-blue-600"> (Your vote)</span>}
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