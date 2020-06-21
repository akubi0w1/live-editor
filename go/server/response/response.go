package response

import (
	"encoding/json"
	"log"
	"net/http"
)

func Success(w http.ResponseWriter, data interface{}) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Println("failed to marshal: %v", err)
		InternalServerError(w, err.Error())
		return
	}
	w.Write(jsonData)
	return
}

func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
	return
}

func InternalServerError(w http.ResponseWriter, message string) {
	jsonData, _ := json.Marshal(httpResponse(http.StatusInternalServerError, message))
	w.Write(jsonData)
	return
}

func BadRequest(w http.ResponseWriter, message string) {
	jsonData, _ := json.Marshal(httpResponse(http.StatusBadRequest, message))
	w.Write(jsonData)
	return
}

func MethodNotAllowed(w http.ResponseWriter) {
	jsonData, _ := json.Marshal(httpResponse(http.StatusMethodNotAllowed, "method not allowed"))
	w.Write(jsonData)
	return
}

func httpResponse(code int, message string) httpError {
	return httpError{
		Code:    code,
		Message: message,
	}
}

type httpError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}
