package models

type ApiResponse struct {
    Data  interface{} `json:"data,omitempty"`
    Error string      `json:"error,omitempty"`
}