import "bootstrap/dist/css/bootstrap.min.css"
import { useEffect, useMemo, useState } from "react"
import { Container} from "react-bootstrap"
import { Routes, Route, Navigate } from "react-router-dom"
import { NewNote } from "./NewNote"
import { useLocalStorage } from "./useLocalStorage"
import { v4 as uuidV4 } from "uuid"
import { NoteLayout } from "./NoteLayout"
import { EditNote } from "./EditNote"
import { Note } from "./Note"
import { NoteList } from './NoteList';
import { Dashboard } from "./Dashboard"




export type Note = {
  id: string
} & NoteData

export type RawNote = {
  id: string
} & RawNoteData

export type StudySession = {
  start: string 
  end: string   
}


export type RawNoteData = {
  title: string
  markdown: string
  tagIds: string[]
  sessions?: StudySession[] 

}

export type NoteData = {
  title: string
  markdown: string
  tags: Tag[]
  sessions?: StudySession[]

}

export type Tag = {
  id: string
  label: string
}

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", [])
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", [])

  const notesWithTags = useMemo(() => {
    return notes.map(note => {
      return { ...note, tags: tags.filter(tag => note.tagIds.includes(tag.id)) }
    })
  }, [notes, tags])

  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  
  useEffect(() => {
  if (notes.length === 0) {
    setNotes([
      {
        id: "welcome-note",
        title: "Welcome!",
        markdown: "This is your first note.",
        tagIds: [],
        sessions: []
      }
    ])
  }
}, [])

function startSession() {
  setSessionStart(new Date());
}

function endSession(noteId: string) {
  if (sessionStart) {
    const newSession: StudySession = {
      start: sessionStart.toISOString(),
      end: new Date().toISOString()
    };
    setNotes(prev =>
      prev.map(note =>
        note.id === noteId
          ? {
              ...note,
              sessions: [...(note.sessions ?? []), newSession]
            }
          : note
      )
    );
    setSessionStart(null);
  }
}
  
const tagStudyTimes = useMemo(() => {
  const times: Record<string, number> = {};
  tags.forEach(tag => {
    const notesForTag = notesWithTags.filter(note =>
      note.tags.some(t => t.id === tag.id)
    );
    const totalSeconds = notesForTag.reduce((sum, note) => {
      return sum + (note.sessions?.reduce((s, session) => {
        const start = new Date(session.start).getTime();
        const end = new Date(session.end).getTime();
        return s + (end - start) / 1000;
      }, 0) ?? 0);
    }, 0);
    times[tag.id] = totalSeconds;
  });
  return times;
}, [notesWithTags, tags]); 

const tagNoteCounts = useMemo(() => {
  const counts: Record<string, number> = {};
  tags.forEach(tag => {
    counts[tag.id] = notesWithTags.filter(note =>
      note.tags.some(t => t.id === tag.id)
    ).length;
  });
  
  return counts;
}, [notesWithTags, tags]);

  

  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes(prevNotes => {
      return [
        ...prevNotes,
        { ...data, id: uuidV4(), tagIds: tags.map(tag => tag.id) },
      ]
    })
  }

  function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    setNotes(prevNotes => {
      return prevNotes.map(note => {
        if (note.id === id) {
          return { ...note, ...data, tagIds: tags.map(tag => tag.id) }
        } else {
          return note
        }
      })
    })
  }

  function onDeleteNote(id: string) {
    setNotes(prevNotes => {
      return prevNotes.filter(note => note.id !== id)
    })
  }

  function addTag(tag: Tag) {
    setTags(prev => [...prev, tag])
  }

  function updateTag(id: string, label: string) {
    setTags(prevTags => {
      return prevTags.map(tag => {
        if (tag.id === id) {
          return { ...tag, label }
        } else {
          return tag
        }
      })
    })
  }

  function deleteTag(id: string) {
    setTags(prevTags => {
      return prevTags.filter(tag => tag.id !== id)
    })
  }

  return (
    <Container fluid className="my-4 px-5">
    <div style={{ maxWidth: "100vw", padding: "0 2rem" }}>
     <Dashboard
  tags={tags}
  tagNoteCounts={tagNoteCounts}
  tagStudyTimes={tagStudyTimes}
/>
 
  <Routes>
    <Route
    path="/"
    element={
      <NoteList
        notes={notesWithTags}
        availableTags={tags}
        onUpdateTag={updateTag}
        onDeleteTag={deleteTag}
    />
  }
/>

      <Route
  path="/new"
  element={
    <NewNote
      onSubmit={onCreateNote}
      onAddTag={addTag}
      availableTags={tags}
    />
  }
/>  
        <Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
  <Route
    index
    element={
      <Note
        onDelete={onDeleteNote}
        startSession={startSession}
        endSession={endSession}
        sessionStart={sessionStart}
      />
    }
  />
  <Route
    path="edit"
    element={
      <EditNote
        onSubmit={onUpdateNote}
        onAddTag={addTag}
        availableTags={tags}
        startSession={startSession}
        endSession={endSession}
        sessionStart={sessionStart}
      />
    }
  />
</Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </div>
    </Container>
  )
}

export default App