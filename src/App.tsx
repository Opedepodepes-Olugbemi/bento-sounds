"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Play, Pause, Music, Upload } from "lucide-react"

interface Sound {
  id: number
  name: string
  url: string
  isPlaying: boolean
}

export default function BentoMusicPlayer() {
  const [sounds, setSounds] = useState<Sound[]>([])
  const [newSoundName, setNewSoundName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement }>({})

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      sounds.forEach(sound => URL.revokeObjectURL(sound.url))
    }
  }, [])

  const addSound = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newSound = {
        id: Date.now(),
        name: newSoundName || file.name,
        url: URL.createObjectURL(file),
        isPlaying: false
      }
      setSounds(prevSounds => [...prevSounds, newSound])
      setNewSoundName("")
    }
    reader.readAsArrayBuffer(file)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      addSound(file)
    }
  }

  const togglePlay = (id: number) => {
    const audio = audioRefs.current[id]
    if (audio) {
      setSounds(prevSounds => prevSounds.map(sound => {
        if (sound.id === id) {
          if (sound.isPlaying) {
            audio.pause()
            return { ...sound, isPlaying: false }
          } else {
            audio.play()
            return { ...sound, isPlaying: true }
          }
        }
        return sound
      }))
    }
  }

  return (
    <div className="p-6 bg-gray-100 rounded-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Soothing Music Player</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {sounds.map((sound) => (
          <Button
            key={sound.id}
            className="flex items-center bg-black justify-between mb-2"
            onClick={() => togglePlay(sound.id)}
            aria-label={sound.isPlaying ? "Pause" : "Play"}
          >
            <span className="font-medium text-white truncate">{sound.name}</span>
            <audio
              ref={el => { if (el) audioRefs.current[sound.id] = el }}
              src={sound.url}
              loop
              onEnded={() => {
                setSounds(prevSounds => prevSounds.map(s => 
                  s.id === sound.id ? { ...s, isPlaying: false } : s
                ))
              }}
            />
          </Button>
        ))}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col space-y-2">
          <Input
            type="text"
            placeholder="Sound name (optional)"
            value={newSoundName}
            onChange={(e) => setNewSoundName(e.target.value)}
          />
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            aria-label="Upload audio file"
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} className="w-full">
            <Upload className="mr-2 h-4 w-4" /> Upload Sound
          </Button>
        </div>
      </div>
    </div>
  )
}