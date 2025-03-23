package models

type KPI struct {
    Target   string `json:"target"`
    Achieved int    `json:"achieved"`
    Status   string `json:"status"` // "on-track", "behind", "completed"
}