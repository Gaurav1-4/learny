const fs = require('fs');
let content = fs.readFileSync('src/components/study/study-decks.tsx', 'utf-8');

const importLogic = `
  // Import Deck (JSON / Markdown)
  const handleImportDeck = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,.md"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const text = await file.text()
      if (file.name.endsWith(".json")) {
        try {
           const parsed = JSON.parse(text)
           if (parsed.id && parsed.flashcards) {
             setDecks([ { ...parsed, id: \`deck-\${Date.now()}\` }, ...decks ])
           } else if (Array.isArray(parsed)) {
             setDecks([ ...parsed.map((d, i) => ({...d, id: \`deck-\${Date.now()}-\${i}\`})), ...decks ])
           }
        } catch (err) {
           console.error("Invalid JSON format")
        }
      } else if (file.name.endsWith(".md")) {
        const lines = text.split('\\n')
        let title = "Imported Deck"
        const flashcards: Flashcard[] = []
        let currentQ = ""
        let currentA = ""
        let parsingAnswer = false
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          if (line.startsWith("# Study Guide:")) {
            title = line.replace("# Study Guide:", "").trim()
          } else if (line.startsWith("### ") && !line.startsWith("### Q")) {
             if (currentQ) {
               flashcards.push({ id: \`fc-\${Date.now()}-\${flashcards.length}\`, question: currentQ, answer: currentA.trim(), status: "new" })
             }
             currentQ = line.replace(/###\\s+\\d+\\./, "").trim()
             currentA = ""
             parsingAnswer = false
          } else if (line.startsWith("**Answer:**")) {
             parsingAnswer = true
          } else if (line.startsWith("---")) {
             if (currentQ) {
               flashcards.push({ id: \`fc-\${Date.now()}-\${flashcards.length}\`, question: currentQ, answer: currentA.trim(), status: "new" })
               currentQ = ""
               currentA = ""
               parsingAnswer = false
             }
          } else if (parsingAnswer) {
             currentA += line + "\\n"
          }
        }
        if (currentQ) {
           flashcards.push({ id: \`fc-\${Date.now()}-\${flashcards.length}\`, question: currentQ, answer: currentA.trim(), status: "new" })
        }
        
        if (flashcards.length > 0) {
           setDecks([ { id: \`deck-\${Date.now()}\`, title, flashcards, quizQuestions: [], createdAt: new Date().toISOString() }, ...decks ])
        }
      }
    }
    input.click()
  }

  // Delete Deck
`;

content = content.replace('// Delete Deck', importLogic);

content = content.replace(
  '<Button\n            variant="outline"\n            className="border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300"\n          >\n            <Upload className="h-4 w-4 mr-1.5" /> Import\n          </Button>',
  '<Button\n            variant="outline"\n            onClick={handleImportDeck}\n            className="border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300"\n          >\n            <Upload className="h-4 w-4 mr-1.5" /> Import\n          </Button>'
);

fs.writeFileSync('src/components/study/study-decks.tsx', content);
