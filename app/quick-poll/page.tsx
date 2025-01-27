"use client"

import { useState, useRef } from "react"
import { PlusCircle, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TimePickerInput } from "@/components/time-picker-input"

export default function QuickNotesForm() {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState<string[]>([""])
  const [duration, setDuration] = useState(1)
  const [date, setDate] = useState<Date | undefined>(new Date(new Date().setHours(0, 0, 0, 0)))

  const minuteRef = useRef<HTMLInputElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)
  const secondRef = useRef<HTMLInputElement>(null)

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
    setOptions(updatedOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentDate = new Date()
    const expirationDate = new Date(currentDate.getTime() + date.getTime())
    const response = await fetch('/api/quick-poll/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: question, options, duration: expirationDate }),
    })

    if (response.ok) {
      console.log("Poll created successfully")
    } else {
      console.error("Failed to create poll")
    }
  }

  return (
    <div>
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <h1 className="text-center text-3xl font-bold">Quick Poll</h1>
        <h2 className="text-center font-semibold text-md"> Quickly create a poll with a sharable link</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="question" className="text-lg font-medium">
              Question
            </Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your poll here"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-medium">Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
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
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <div className="grid gap-1 text-center">
              <Label htmlFor="hours" className="text-xs">
                Hours
              </Label>
              <TimePickerInput
                picker="hours"
                date={date}
                setDate={(newDate) => {
                  setDate(newDate)
                  setDuration(newDate?.getHours() || 1)
                }}
                ref={hourRef}
                onRightFocus={() => minuteRef.current?.focus()}
                className="text-lg"
              />
            </div>
            <div className="grid gap-1 text-center">
              <Label htmlFor="minutes" className="text-xs">
                Minutes
              </Label>
              <TimePickerInput
                picker="minutes"
                date={date}
                setDate={setDate}
                ref={minuteRef}
                onLeftFocus={() => hourRef.current?.focus()}
                onRightFocus={() => secondRef.current?.focus()}
                className="text-lg"
              />
            </div>
            <div className="grid gap-1 text-center">
              <Label htmlFor="seconds" className="text-xs">
                Seconds
              </Label>
              <TimePickerInput
                picker="seconds"
                date={date}
                setDate={setDate}
                ref={secondRef}
                onLeftFocus={() => minuteRef.current?.focus()}
                className="text-lg"
              />
            </div>
            <div className="flex h-10 items-center">
              <Clock className="ml-2 h-6 w-6" />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Submit Poll
          </Button>
        </form>
      </div>
    </div>
  )
}
