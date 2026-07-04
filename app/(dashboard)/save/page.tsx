"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SaveFromExtensionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const url = searchParams.get("url")

  const [state, setState] = useState<"saving" | "success" | "error">("saving")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!url) {
      setState("error")
      setErrorMsg("No URL provided.")
      return
    }

    fetch("/api/articles/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Error ${res.status}`)
        }
        setState("success")
        // Auto-redirect to library after 2 seconds
        setTimeout(() => router.push("/library"), 2000)
      })
      .catch((err) => {
        setState("error")
        setErrorMsg(err.message || "An unexpected error occurred.")
      })
  }, [url, router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-sm w-full border border-[#E5E5E5] bg-white p-10 text-center">
        {state === "saving" && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[#BDBDBD] mx-auto mb-4" />
            <h1 className="font-heading font-bold text-xl text-[#1A1A1A] mb-2">Saving article…</h1>
            <p className="text-sm text-[#52525B] font-sans truncate">{url}</p>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h1 className="font-heading font-bold text-xl text-[#1A1A1A] mb-2">Saved!</h1>
            <p className="text-sm text-[#52525B] font-sans mb-4">Taking you to your library…</p>
            <Link href="/library" className="text-xs underline underline-offset-2 text-[#52525B]">Go now</Link>
          </>
        )}
        {state === "error" && (
          <>
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h1 className="font-heading font-bold text-xl text-[#1A1A1A] mb-2">Could not save</h1>
            <p className="text-sm text-[#52525B] font-sans mb-4">{errorMsg}</p>
            <Link href="/library" className="text-xs underline underline-offset-2 text-[#52525B]">Go to Library</Link>
          </>
        )}
      </div>
    </div>
  )
}
