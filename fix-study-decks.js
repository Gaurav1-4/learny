const fs = require('fs');

let content = fs.readFileSync('src/components/study/study-decks.tsx', 'utf-8');

// 1. Add QueueFilter state
content = content.replace(
  'const [studyMode, setStudyMode] = useState<"flashcards" | "quiz" | null>(null)',
  'const [studyMode, setStudyMode] = useState<"flashcards" | "quiz" | null>(null)\n  const [queueFilter, setQueueFilter] = useState<"all" | "due" | "mastered">("all")'
);

// 2. Add derived queue logic and modify handlers
content = content.replace(
  '// Start Flashcards\n  const startFlashcards = (deck: StudyDeck) => {\n    setActiveDeck(deck)\n    setCurrentCardIndex(0)\n    setIsFlipped(false)\n    setStudyMode("flashcards")\n  }',
  `// Derived Queue
  const currentQueue = activeDeck ? activeDeck.flashcards.filter((f) => {
    if (queueFilter === "due") return isDue(f.nextReviewDate) || f.status === "new" || f.status === "review"
    if (queueFilter === "mastered") return f.status === "mastered"
    return true
  }) : []

  // Start Flashcards
  const startFlashcards = (deck: StudyDeck) => {
    setActiveDeck(deck)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setStudyMode("flashcards")
  }`
);

// 3. Fix handleNextCard and handlePrevCard to use currentQueue
content = content.replace(
  /const handleNextCard = \(\) => {[\s\S]*?const handlePrevCard = \(\) => {[\s\S]*?}/,
  `const handleNextCard = () => {
    if (!activeDeck || currentQueue.length === 0) return
    setIsFlipped(false)
    setCurrentCardIndex((prev) => (prev + 1) % currentQueue.length)
  }

  const handlePrevCard = () => {
    if (!activeDeck || currentQueue.length === 0) return
    setIsFlipped(false)
    setCurrentCardIndex(
      (prev) => (prev - 1 + currentQueue.length) % currentQueue.length
    )
  }`
);

// 4. Update handleRateCard to use calculateSM2
content = content.replace(
  /const handleRateCard = \(status: "review" \| "mastered"\) => {[\s\S]*?handleNextCard\(\)\n  }/,
  `const handleRateCard = (grade: number) => {
    if (!activeDeck || currentQueue.length === 0) return
    const card = currentQueue[currentCardIndex]
    const sm2 = calculateSM2(grade, card.repetitions, card.easeFactor, card.interval)
    
    let newStatus: "new" | "review" | "mastered" = "review"
    if (grade >= 4 && sm2.interval >= 21) newStatus = "mastered"
    else if (grade >= 3 && sm2.interval >= 3) newStatus = "review"

    const updatedCard = {
      ...card,
      status: newStatus,
      repetitions: sm2.repetitions,
      easeFactor: sm2.easeFactor,
      interval: sm2.interval,
      nextReviewDate: sm2.nextReviewDate,
      lastReviewed: new Date().toISOString()
    }

    const updatedCards = activeDeck.flashcards.map(c => c.id === card.id ? updatedCard : c)
    const updatedDeck = { ...activeDeck, flashcards: updatedCards }
    
    setActiveDeck(updatedDeck)
    setDecks(decks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)))
    
    setIsFlipped(false)
    if (currentQueue.length > 1) {
       setCurrentCardIndex((prev) => (prev === currentQueue.length - 1 ? 0 : prev))
    }
  }`
);

// 5. Replace Flashcard Study View Controls
const newControls = `
          {/* Queue Filter */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {(["all", "due", "mastered"] as const).map((f) => (
              <Badge
                key={f}
                variant={queueFilter === f ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => {
                  setQueueFilter(f)
                  setCurrentCardIndex(0)
                  setIsFlipped(false)
                }}
              >
                {f} ({activeDeck.flashcards.filter(c => f === "due" ? (isDue(c.nextReviewDate) || c.status !== "mastered") : f === "mastered" ? c.status === "mastered" : true).length})
              </Badge>
            ))}
          </div>

          {currentQueue.length === 0 ? (
            <div className="text-center py-20 text-zinc-400">
              No cards in this queue. You're all caught up!
            </div>
          ) : (
            <>
              {/* Flashcard Progress Bar */}
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{
                    width: \`\${((currentCardIndex + 1) / currentQueue.length) * 100}%\`,
                  }}
                />
              </div>

              {/* Interactive Flip Card */}
              <div className="flex justify-center">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full max-w-2xl min-h-[340px] cursor-pointer rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl transition-all hover:border-zinc-700 flex flex-col justify-between select-none relative group"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold uppercase tracking-wider">
                      {isFlipped ? "Answer" : "Question / Prompt"}
                    </span>
                    <span className="text-[11px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                      Click or Space to Flip
                    </span>
                  </div>

                  <div className="my-auto py-8 text-center">
                    <h3 className="text-2xl font-bold text-zinc-100 leading-relaxed whitespace-pre-wrap">
                      {isFlipped
                        ? currentQueue[currentCardIndex]?.answer
                        : currentQueue[currentCardIndex]?.question}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-800/80">
                    <span>Deck: {activeDeck.title}</span>
                    <Badge
                      variant={
                        currentQueue[currentCardIndex]?.status === "mastered"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {currentQueue[currentCardIndex]?.status || "new"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Controls & Rating Bar */}
              {isFlipped ? (
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Button
                    size="lg"
                    onClick={() => handleRateCard(0)}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 flex flex-col h-auto py-2"
                  >
                    <span>Again</span>
                    <span className="text-[10px] opacity-70">&lt; 1m</span>
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleRateCard(3)}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 flex flex-col h-auto py-2"
                  >
                    <span>Hard</span>
                    <span className="text-[10px] opacity-70">
                      {calculateSM2(3, currentQueue[currentCardIndex]?.repetitions, currentQueue[currentCardIndex]?.easeFactor, currentQueue[currentCardIndex]?.interval).interval}d
                    </span>
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleRateCard(4)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 flex flex-col h-auto py-2"
                  >
                    <span>Good</span>
                    <span className="text-[10px] opacity-70">
                      {calculateSM2(4, currentQueue[currentCardIndex]?.repetitions, currentQueue[currentCardIndex]?.easeFactor, currentQueue[currentCardIndex]?.interval).interval}d
                    </span>
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleRateCard(5)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 flex flex-col h-auto py-2"
                  >
                    <span>Easy</span>
                    <span className="text-[10px] opacity-70">
                      {calculateSM2(5, currentQueue[currentCardIndex]?.repetitions, currentQueue[currentCardIndex]?.easeFactor, currentQueue[currentCardIndex]?.interval).interval}d
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrevCard}
                    className="border-zinc-800 hover:bg-zinc-800"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleNextCard}
                    className="border-zinc-800 hover:bg-zinc-800"
                  >
                    Next <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
`;

content = content.replace(
  /{\/\* Flashcard Progress Bar \*\/}[\s\S]*?(?={\/\* QUIZ STUDY VIEW \*\/})/,
  newControls + '\n        </div>\n      )}\n\n      '
);

const headerHTML = `
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Study Decks & Flashcards</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Active recall, practice quizzes, and AI study cards linked to your college coursework.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300"
          >
            <Upload className="h-4 w-4 mr-1.5" /> Import
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="h-4 w-4 mr-1.5" /> Generate / Add Deck
          </Button>
        </div>
      </div>
`;
content = content.replace(/{\/\* Header \*\/}[\s\S]*?(?={\/\* FLASHCARD STUDY VIEW \*\/})/, headerHTML + '\n      ');

content = content.replace(
  /const masteredCount = deck\.flashcards\.filter\(\(f\) => f\.status === "mastered"\)\.length/,
  `const masteredCount = deck.flashcards.filter((f) => f.status === "mastered").length
            const dueCount = deck.flashcards.filter((f) => isDue(f.nextReviewDate) || f.status !== "mastered").length
            const retentionPct = deck.flashcards.length > 0 
                ? Math.round(deck.flashcards.reduce((acc, f) => acc + Math.min(100, Math.max(0, (f.easeFactor || 2.5) * 10)), 0) / deck.flashcards.length)
                : 0`
);

content = content.replace(
  /<div className="flex justify-between text-\[11px\] text-zinc-400">\s*<span>{deck\.flashcards\.length} flashcards<\/span>\s*<span>{progressPct}% mastered<\/span>\s*<\/div>\s*<div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">\s*<div className="bg-emerald-500 h-full" style={{ width: \`\${progressPct}%\` }} \/>\s*<\/div>/,
  `<div className="flex justify-between text-[11px] text-zinc-400">
                      <span>{deck.flashcards.length} flashcards</span>
                      <span className="font-semibold text-amber-500">{dueCount} due for review</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: \`\${progressPct}%\` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                      <span>Retention: {retentionPct}%</span>
                      <span>{progressPct}% mastered</span>
                    </div>`
);

fs.writeFileSync('src/components/study/study-decks.tsx', content);
