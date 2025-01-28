import { Button } from "@/components/ui/button"
import Link from "next/link"
import Navbar from "@/components/Navbar" // Import Navbar component

export default function Home() {
  return (
    <div>
      <Navbar />
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b from-[#0b0613] to-gray-900 p-4">
      
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#4f01d5' }}>Pollify</h1>

        <p className="mb-8 text-lg text-gray-400 max-w-md mx-auto">
          Create instant polls to get quick feedback and opinions from a community, friends or family with a click of a button.
        </p>

        <div className="space-x-4">
          <Button asChild>
            <Link href="https://www.youtube.com/watch?v=cNc9g3lnwSs">Demo</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/quick-poll">Create a Poll</Link>
          </Button>
        </div>
      </main>
    </div>
    </div>
  );
}
