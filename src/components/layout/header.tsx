export function Header({ title }: { title: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
    </header>
  )
}
