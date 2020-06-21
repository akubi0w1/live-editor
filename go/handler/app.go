package handler

import (
	"database/sql"
	"live-editor/server/response"
	"net/http"
)

type AppHandler struct {
	noteHandler NoteHandler
}

func NewAppHandler(db *sql.DB) *AppHandler {
	return &AppHandler{
		noteHandler: NewNoteHandler(db),
	}
}

func (ah *AppHandler) NoteHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		ah.noteHandler.CreateNote(w, r)
	case "GET":
		ah.noteHandler.GetAllNotes(w, r)
	default:
		response.MethodNotAllowed(w)
	}
}

func (ah *AppHandler) OneNoteHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "PUT":
		ah.noteHandler.UpdateNote(w, r)
	case "DELETE":
		ah.noteHandler.DeleteNote(w, r)
	default:
		response.MethodNotAllowed(w)
	}
}
