import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function Home() {
  return (
    <div>
      <h1 className="xl">Create a poll</h1>
       <Button>Click me</Button>
       <Textarea
                  placeholder="Enter your question"
                  className="resize-none w-96"
                />
    </div>
  );
}
