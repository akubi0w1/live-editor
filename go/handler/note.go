package handler

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"live-editor/domain"
	"live-editor/server/response"
	"live-editor/utility"
	"log"
	"net/http"
	"strings"
	"time"
)

type noteHandler struct {
	DB *sql.DB
}

type NoteHandler interface {
	GetAllNotes(w http.ResponseWriter, r *http.Request)
	CreateNote(w http.ResponseWriter, r *http.Request)
	UpdateNote(w http.ResponseWriter, r *http.Request)
	DeleteNote(w http.ResponseWriter, r *http.Request)
}

func NewNoteHandler(db *sql.DB) NoteHandler {
	return &noteHandler{
		DB: db,
	}
}

func (nh *noteHandler) GetAllNotes(w http.ResponseWriter, r *http.Request) {
	rows, err := nh.DB.Query("SELECT id, title, body, author, created_at, updated_at FROM notes")
	var notes NotesResponse
	for rows.Next() {
		var note domain.Note
		if err = rows.Scan(&note.ID, &note.Title, &note.Body, &note.Author, &note.CreatedAt, &note.UpdatedAt); err != nil {
			if err == sql.ErrNoRows {
				break
			}
			log.Printf("db scan error: %v", err)
			response.InternalServerError(w, err.Error())
			return
		}
		notes.Notes = append(notes.Notes, convertToNoteResponse(&note))
	}
	response.Success(w, notes)
	return
}

func (nh *noteHandler) CreateNote(w http.ResponseWriter, r *http.Request) {
	// request parse
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("failed to read body: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}
	var req UpdateNoteRequest
	err = json.Unmarshal(body, &req)
	if err != nil {
		log.Printf("failed to unmarshal: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}
	// validation
	if req.Title == "" || req.Body == "" || req.Author == "" {
		log.Printf("bad request: request body have empty values")
		response.BadRequest(w, "request body has empty values")
		return
	}

	// create datas
	id, err := utility.GenerateID()
	if err != nil {
		log.Printf("failed to generate id: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}
	newNote := domain.Note{
		ID:        id,
		Title:     req.Title,
		Body:      req.Body,
		Author:    req.Author,
		CreatedAt: time.Now().Format("2006-01-02 03:04:05"),
		UpdatedAt: time.Now().Format("2006-01-02 03:04:05"),
	}

	// add database
	_, err = nh.DB.Exec(`
		INSERT INTO notes(id, title, body, author, created_at, updated_at)
		VALUES (?,?,?,?,?,?)
	`, newNote.ID, newNote.Title, newNote.Body, newNote.Author, newNote.CreatedAt, newNote.UpdatedAt)
	if err != nil {
		log.Printf("failed to insert data: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}

	// response
	response.Success(w, convertToNoteResponse(&newNote))
	return
}

func (nh *noteHandler) UpdateNote(w http.ResponseWriter, r *http.Request) {
	id := strings.Split(r.URL.Path, "/")[2]

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("failed to read body: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}
	var req UpdateNoteRequest
	err = json.Unmarshal(body, &req)
	if err != nil {
		log.Printf("failed to unmarshal: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}
	// validation
	if req.Title == "" || req.Author == "" {
		log.Printf("bad request: request body have empty values")
		response.BadRequest(w, "request body has empty values")
		return
	}

	newNote := domain.Note{
		ID:        id,
		Title:     req.Title,
		Body:      req.Body,
		Author:    req.Author,
		UpdatedAt: time.Now().Format("2006-01-02 03:04:05"),
	}

	_, err = nh.DB.Exec(`
		UPDATE notes
		SET title=?, body=?, author=?, updated_at=?
		WHERE id=?
	`, newNote.Title, newNote.Body, newNote.Author, newNote.UpdatedAt, newNote.ID)
	if err != nil {
		log.Printf("failed to update data: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, convertToNoteResponse(&newNote))
	return
}

func (nh *noteHandler) DeleteNote(w http.ResponseWriter, r *http.Request) {
	id := strings.Split(r.URL.Path, "/")[2]

	_, err := nh.DB.Exec(`
		DELETE FROM notes
		WHERE id=?
	`, id)
	if err != nil {
		log.Printf("failed to update data: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}

	response.NoContent(w)
	return
}

type UpdateNoteRequest struct {
	Title  string `json:"title"`
	Body   string `json:"body"`
	Author string `json:"author"`
}

type NotesResponse struct {
	Notes []*NoteResponse `json:"notes"`
}

type NoteResponse struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Body      string `json:"body`
	Author    string `json:"author"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func convertToNoteResponse(note *domain.Note) *NoteResponse {
	return &NoteResponse{
		ID:        note.ID,
		Title:     note.Title,
		Body:      note.Body,
		Author:    note.Author,
		CreatedAt: note.CreatedAt,
		UpdatedAt: note.UpdatedAt,
	}
}
