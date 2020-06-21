package server

import (
	"live-editor/handler"
	"log"
	"net/http"
)

type server struct {
	Addr string
}

type Server interface {
	Serve(app *handler.AppHandler)
}

func NewServer(addr string) Server {
	return &server{
		Addr: addr,
	}
}

func (s *server) Serve(app *handler.AppHandler) {
	http.HandleFunc("/ping", pingHandler)
	// routing
	http.HandleFunc("/notes", app.NoteHandler)
	http.HandleFunc("/notes/", app.OneNoteHandler)

	log.Println("server running http://localhost:8080")
	http.ListenAndServe(s.Addr, nil)
}

func pingHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("ping")
}
