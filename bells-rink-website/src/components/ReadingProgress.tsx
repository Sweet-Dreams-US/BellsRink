import React, { useState, useEffect } from 'react'
import { articleProgress } from '../lib/reading'
import './ReadingProgress.css'

const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => setProgress(articleProgress() * 100)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div className="reading-progress" role="progressbar" aria-label="Reading progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
      <div className="reading-progress__bar" style={{ width: `${progress}%` }} />
    </div>
  )
}

export default ReadingProgress
