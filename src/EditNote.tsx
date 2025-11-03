import { NoteForm } from "./NoteForm"
import { useNote } from "./NoteLayout"
import type { NoteData, Tag } from "./App"
import { Button } from "react-bootstrap"

type EditNoteProps = {
  onSubmit: (id: string, data: NoteData) => void
  onAddTag: (tag: Tag) => void
  availableTags: Tag[]
  startSession: () => void
  endSession: (id: string) => void
  sessionStart: Date | null
}

export function EditNote({
  onSubmit,
  onAddTag,
  availableTags,
  startSession,
  endSession,
  sessionStart
}: EditNoteProps) {
  const note = useNote()

  return (
    <>
      <h1 className="mb-4">Edit Note</h1>
      <NoteForm
        title={note.title}
        markdown={note.markdown}
        tags={note.tags}
        onSubmit={data => onSubmit(note.id, data)}
        onAddTag={onAddTag}
        availableTags={availableTags}
      />
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
      <Button onClick={startSession} disabled={!!sessionStart} className="me-2">
       Start Study Session
      </Button>
      <Button onClick={() => endSession(note.id)} disabled={!sessionStart} variant="success">
        End Study Session
      </Button>
</div>
    </>
  )
}