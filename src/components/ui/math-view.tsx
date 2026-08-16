"use client"

import React, { useMemo } from "react"
import katex from "katex"

interface MathViewProps {
  math: string
  displayMode?: boolean
  className?: string
}

export function MathView({ math, displayMode = false, className = "" }: MathViewProps) {
  const html = useMemo(() => {
    try {
      // Clean leading and trailing delimiters if present
      let cleanMath = math.trim()
      if (cleanMath.startsWith("$$") && cleanMath.endsWith("$$")) {
        cleanMath = cleanMath.slice(2, -2).trim()
      } else if (cleanMath.startsWith("$") && cleanMath.endsWith("$")) {
        cleanMath = cleanMath.slice(1, -1).trim()
      } else if (cleanMath.startsWith("\\[") && cleanMath.endsWith("\\]")) {
        cleanMath = cleanMath.slice(2, -2).trim()
      } else if (cleanMath.startsWith("\\(") && cleanMath.endsWith("\\)")) {
        cleanMath = cleanMath.slice(2, -2).trim()
      }

      return katex.renderToString(cleanMath, {
        displayMode,
        throwOnError: false,
        output: "htmlAndMathml",
      })
    } catch (e) {
      return math
    }
  }, [math, displayMode])

  return (
    <span
      className={`katex-math inline-block ${displayMode ? "my-2 overflow-x-auto max-w-full text-center" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Component that parses a string containing mixed text and LaTeX (e.g. $z_0 = i$ or \oint_C ...)
 * and renders the math parts using KaTeX.
 */
export function FormattedMathText({ text, className = "" }: { text: string; className?: string }) {
  const elements = useMemo(() => {
    if (!text) return null

    // Split by inline math $...$
    const parts = text.split(/(\$[^$]+\$)/g)

    return parts.map((part, index) => {
      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        const mathContent = part.slice(1, -1)
        return <MathView key={index} math={mathContent} displayMode={false} />
      }
      return <span key={index}>{part}</span>
    })
  }, [text])

  return <span className={className}>{elements}</span>
}
