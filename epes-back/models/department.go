package models

type Department struct {
	Model
	Name   	 string `json:"name"`
	Location string `jsong:"location"`
}