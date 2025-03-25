// end chadvaruud orno
package models

import "time"

type Competency struct {
	Model
	Name        string  `json:"name"`
	Description string  `json:"description"`
}

//end ajiltanii chadvariig
type EmployeeCompetencyRating struct {
	Model
	EmployeeID   string      `json:"employee_id"`
	CompetencyID string      `json:"competency_id"`
	Score        float64     `json:"score"`
	RatedBy      string      `json:"rated_by"`
	RatedAt      time.Time   `json:"rated_at"`
}
