package main

import (
	"database/sql"
	"live-editor/handler"
	"live-editor/server"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// connect database
	conn, err := sql.Open("mysql", "root:password@tcp(localhost:3307)/live_edit")
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
		return
	}

	// create handler
	app := handler.NewAppHandler(conn)

	// create server
	serv := server.NewServer("localhost:8080")

	// server running
	serv.Serve(app)

}
