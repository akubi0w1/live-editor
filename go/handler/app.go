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
	// TODO: 何とかしろw
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Add("Access-Control-Allow-Methods", "GET, PUT, DELETE")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type,Accept,Origin,x-token")

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
	// TODO: 何とかしろw
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Add("Access-Control-Allow-Methods", "GET, PUT, DELETE")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type,Accept,Origin,x-token")
	switch r.Method {
	case "GET":
		ah.noteHandler.GetNoteByID(w, r)
	case "PUT":
		ah.noteHandler.UpdateNote(w, r)
	case "DELETE":
		ah.noteHandler.DeleteNote(w, r)
	default:
		response.MethodNotAllowed(w)
	}
}
