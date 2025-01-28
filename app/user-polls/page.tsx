"use client"

import { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from 'next/link'
import Navbar from "@/components/Navbar" 

interface Poll {
  _id: string;
  description: string;
  expiresAt: string;
  adminId: string;
  options: {
    [key: string]: {
      text: string;
      votes: number;
    };
  };
}

const UserPolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let session = true;

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch('/api/quick-poll/user-polls');
        if (!response.ok) {
          session = false;
        }
        
        const data = await response.json();
        if (data.polls) {
          setPolls(data.polls);
        } else {
          setPolls([]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  if (error) {
    return (
      <div>
        <Navbar />
      <div className="flex justify-center items-center">
        <h1>Unauthorised</h1>

      </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6">Your Polls</h1>
      {polls.length === 0 ? (
        <p className="text-muted-foreground">No polls found.</p>
      ) : (
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          {polls.map((poll) => (
            <Card key={poll._id} className="mb-4">
              <CardHeader>
                <h2 className="text-xl font-semibold">{poll.description}</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Expires at: {new Date(poll.expiresAt).toLocaleString()}
                </p>
                <ul className="space-y-2">
                  {Object.entries(poll.options).map(([key, option]) => (
                    <li key={key} className="flex justify-between items-center">
                      <span>{option.text}</span>
                      <span className="text-muted-foreground">{option.votes} votes</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/poll/${poll._id}`}>
                    View Poll
                  </Link>
                </Button>
                <Button variant="default" asChild>
                  <Link href={`/poll/${poll._id}/${poll.adminId}`}>
                    Admin Panel
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </ScrollArea>
      )}
    </div>
  )
}

export default UserPolls
