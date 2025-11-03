import type { Tag } from "./App"

type DashboardProps = {
  tags: Tag[]
  tagNoteCounts: Record<string, number>
  tagStudyTimes: Record<string, number>
}

export function Dashboard({ tags, tagNoteCounts, tagStudyTimes }: DashboardProps) {
  return (
    <div>
      <h2>Study Dashboard</h2>
      {tags.map(tag => (
        <div key={tag.id}>
          <strong>{tag.label}</strong>: {tagNoteCounts[tag.id] ?? 0} notes,{" "}
          {Math.round((tagStudyTimes[tag.id] ?? 0) / 60)} minutes studied
        </div>
      ))}
    </div>
  )
}