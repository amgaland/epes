package models

type Employee struct {
    ID       int      `json:"id"`
    Name     string   `json:"name"`
    Role     string   `json:"role"`
    KPI      KPI      `json:"kpi"`
    OKR      OKR      `json:"okr"`
    Feedback []string `json:"feedback"`
}