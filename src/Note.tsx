import { Badge, Button, Col, Row, Stack } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { useNote } from "./NoteLayout"
import ReactMarkdown from "react-markdown"

type NoteProps = {
  onDelete: (id: string) => void
  startSession: () => void
  endSession: (id: string) => void
  sessionStart: Date | null
}

export function Note({ onDelete, startSession, endSession, sessionStart }: NoteProps) {
  const note = useNote()
  const navigate = useNavigate()

  const totalSeconds = (note.sessions ?? []).reduce((sum, session) => {
    const start = new Date(session.start).getTime()
    const end = new Date(session.end).getTime()
    return sum + (end - start) / 1000
  }, 0)

  return (
    <>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={7} xl={6}>
          <h1>{note.title}</h1>
          {note.tags.length > 0 && (
            <Stack gap={1} direction="horizontal" className="flex-wrap">
              {note.tags.map(tag => (
                <Badge className="text-truncate" key={tag.id}>
                  {tag.label}
                </Badge>
              ))}
            </Stack>
          )}
        </Col>
        <Col xs={12} sm={10} md={8} lg={7} xl={6}>
          <Stack gap={2} direction="horizontal">
            <Link to={`/${note.id}/edit`}>
              <Button variant="primary">Edit</Button>
            </Link>
            <Button
              onClick={() => {
                onDelete(note.id)
                navigate("/")
              }}
              variant="outline-danger"
            >
              Delete
            </Button>
            <Link to="/">
              <Button variant="outline-secondary">Back</Button>
            </Link>
          </Stack>
        </Col>
      </Row>

      <ReactMarkdown>{note.markdown}</ReactMarkdown>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Button onClick={startSession} disabled={!!sessionStart} className="me-2">
          Start Study Session
        </Button>
        <Button onClick={() => endSession(note.id)} disabled={!sessionStart} variant="success">
          End Study Session
        </Button>
        <p className="mt-3">
          Total Studied: {Math.round(totalSeconds / 60)} minutes
        </p>
      </div>
    </>
  )
}