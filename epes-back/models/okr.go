package models

type OKR struct {
    Objective   string   `json:"objective"`
    KeyResults  []string `json:"keyResults"`
    Progress    int      `json:"progress"` // 0-100%
}