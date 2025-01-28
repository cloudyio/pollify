"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FaGithub } from "react-icons/fa"
import Navbar from "@/components/Navbar"

export default function SignIn() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow justify-center items-center">
        <Button onClick={() => signIn("github")} className="flex items-center gap-2">
          <FaGithub />
          Sign in with GitHub
        </Button>
      </div>
    </div>
  )
}