"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BarChart, ChevronLeft } from "lucide-react"

export default function Page({
    params,
  }: {
    params: Promise<{ slug: string }>
  }) {
    const [slug, setSlug] = useState<string | null>(null);
    const [pollData, setPollData] = useState<any>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [hasVoted, setHasVoted] = useState(false)
    const [results, setResults] = useState<Record<string, number>>({})

    useEffect(() => {
      async function fetchSlug() {
        const resolvedParams = await params;
        setSlug(resolvedParams.slug);
      }

      fetchSlug();
    }, [params]);

    useEffect(() => {
      if (slug) {
        async function fetchPollData() {
          const response = await fetch(`/api/quick-poll/info`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pollID: slug }),
          });

          if (response.ok) {
            const data = await response.json();
            setPollData(data.poll);
          } else {
            console.error('Failed to fetch poll data');
          }
        }

        fetchPollData();
      }
    }, [slug]);

    useEffect(() => {
      const storedVote = localStorage.getItem(`pollVote_${slug}`)
      if (storedVote) {
        setHasVoted(true)
        setResults(JSON.parse(storedVote))
      }
    }, [slug])

    const handleVote = async () => {
      if (selectedOption && slug) {
        const response = await fetch(`/api/quick-poll/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pollID: slug, optionID: selectedOption }),
        });

        if (response.ok) {
          const newResults = { ...results }
          newResults[selectedOption] = (newResults[selectedOption] || 0) + 1
          setResults(newResults)
          setHasVoted(true)
          localStorage.setItem(`pollVote_${slug}`, JSON.stringify(newResults))
        } else {
          console.error('Failed to update vote');
        }
      }
    }

    const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0)

    if (!pollData) {
      return <div>Loading...</div>;
    }

    return (
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{pollData.description}</CardTitle>
            <CardDescription>{hasVoted ? "Poll results" : "Select an option and submit your vote"}</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasVoted ? (
              <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption}>
                {Object.entries(pollData.options).map(([key, option]) => (
                  <div key={key} className="flex items-center space-x-2">
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
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  )
                })}
                <p className="text-sm text-muted-foreground mt-4">Total votes: {totalVotes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {!hasVoted ? (
              <Button onClick={handleVote} disabled={!selectedOption}>
                Submit Vote
              </Button>
            ) : (
              <Button variant="outline" disabled className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Vote Again
              </Button>
            )}
            {hasVoted && (
              <Button variant="secondary" className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                View Detailed Stats
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }