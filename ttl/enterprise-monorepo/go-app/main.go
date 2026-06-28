package main

import (
	"fmt"
	"net/http"
)

// HealthHandler — basic liveness probe
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "ok")
}

// ReadyHandler — readiness check, extend as needed
func ReadyHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "ready")
}

func main() {
	http.HandleFunc("/health", HealthHandler)
	http.HandleFunc("/ready", ReadyHandler)
	fmt.Println("starting server on :8080")
	http.ListenAndServe(":8080", nil)
}
