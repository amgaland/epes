package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
)

// In-memory store (replace with a database in production)
var evaluations = models.Evaluations{
    Employees: []models.Employee{
        {
            ID:   1,
            Name: "Alice",
            Role: "Developer",
            KPI: models.KPI{
                Target:   "Complete 10 tasks",
                Achieved: 8,
                Status:   "on-track",
            },
            OKR: models.OKR{
                Objective:  "Improve app performance",
                KeyResults: []string{"Reduce load time by 20%", "Fix 5 bugs"},
                Progress:   75,
            },
            Feedback: []string{},
        },
        {
            ID:   2,
            Name: "Bob",
            Role: "Manager",
            KPI: models.KPI{
                Target:   "Increase team output by 15%",
                Achieved: 12,
                Status:   "behind",
            },
            OKR: models.OKR{
                Objective:  "Launch new feature",
                KeyResults: []string{"Release by Q2", "Get 100 users"},
                Progress:   50,
            },
            Feedback: []string{},
        },
    },
}

func GetEvaluations(c *gin.Context) {
    search := c.Query("search")
    filtered := evaluations.Employees

    if search != "" {
        filtered = []models.Employee{}
        for _, emp := range evaluations.Employees {
            idStr := strconv.Itoa(emp.ID)
            if idStr == search || strings.Contains(strings.ToLower(emp.Name), strings.ToLower(search)) {
                filtered = append(filtered, emp)
            }
        }
    }

    c.JSON(http.StatusOK, models.ApiResponse{Data: models.Evaluations{Employees: filtered}})
}

func UpdateEvaluation(c *gin.Context) {
    type UpdateRequest struct {
        EmployeeID int         `json:"employeeId"`
        Type       string      `json:"type"`
        Data       interface{} `json:"data"`
    }

    var req UpdateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.ApiResponse{Error: "Invalid request body"})
        return
    }

    for i, emp := range evaluations.Employees {
        if emp.ID == req.EmployeeID {
            switch req.Type {
            case "feedback":
                if feedback, ok := req.Data.(string); ok {
                    evaluations.Employees[i].Feedback = append(evaluations.Employees[i].Feedback, feedback)
                } else {
                    c.JSON(http.StatusBadRequest, models.ApiResponse{Error: "Invalid feedback data"})
                    return
                }
            case "kpi":
                if kpi, ok := req.Data.(map[string]interface{}); ok {
                    evaluations.Employees[i].KPI = models.KPI{
                        Target:   kpi["target"].(string),
                        Achieved: int(kpi["achieved"].(float64)),
                        Status:   kpi["status"].(string),
                    }
                } else {
                    c.JSON(http.StatusBadRequest, models.ApiResponse{Error: "Invalid KPI data"})
                    return
                }
            case "okr":
                if okr, ok := req.Data.(map[string]interface{}); ok {
                    keyResults := []string{}
                    for _, kr := range okr["keyResults"].([]interface{}) {
                        keyResults = append(keyResults, kr.(string))
                    }
                    evaluations.Employees[i].OKR = models.OKR{
                        Objective:  okr["objective"].(string),
                        KeyResults: keyResults,
                        Progress:   int(okr["progress"].(float64)),
                    }
                } else {
                    c.JSON(http.StatusBadRequest, models.ApiResponse{Error: "Invalid OKR data"})
                    return
                }
            default:
                c.JSON(http.StatusBadRequest, models.ApiResponse{Error: "Invalid update type"})
                return
            }
            c.JSON(http.StatusOK, models.ApiResponse{
                Data: gin.H{"message": "Evaluation updated", "employee": evaluations.Employees[i]},
            })
            return
        }
    }
    c.JSON(http.StatusNotFound, models.ApiResponse{Error: "Employee not found"})
}