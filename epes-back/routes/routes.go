package routes

import (
	"github.com/amgaland/epes/epes-back/controllers"
	admin "github.com/amgaland/epes/epes-back/controllers/admin"
	api "github.com/amgaland/epes/epes-back/controllers/api"
	protected "github.com/amgaland/epes/epes-back/controllers/protected"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
    router.GET("/health", controllers.HealthCheck)

    authRoutes := router.Group("/auth")
    {
        authRoutes.POST("/signin", api.SignIn)
    }

    adminRoutes := router.Group("/admin")
    {
        userRoutes := adminRoutes.Group("/users")
        {
            userRoutes.GET("/", admin.GetAllUsers)
            userRoutes.POST("/", admin.CreateUser)
            userRoutes.PUT("/:id", admin.UpdateUser)
            userRoutes.DELETE("/:id", admin.DeleteUser)
            userRoutes.GET("/check-login-id", admin.CheckLoginIDExists)
        }

        userRoleRoutes := adminRoutes.Group("/user/roles")
        {
            userRoleRoutes.GET("/", admin.GetAllUserRoles)
            userRoleRoutes.POST("/", admin.CreateUserRole)
            userRoleRoutes.PUT("/:id", admin.UpdateUserRole)
            userRoleRoutes.DELETE("/:id", admin.DeleteUserRole)
            userRoleRoutes.GET("/list", admin.UserRoleHandler)
            userRoleRoutes.PUT("/update", admin.UpdateUserRoleHandler)
        }

        roleRoutes := adminRoutes.Group("/roles")
        {
            roleRoutes.GET("/", admin.GetAllRoles)
            roleRoutes.POST("/", admin.CreateRole)
            roleRoutes.PUT("/:id", admin.UpdateRole)
            roleRoutes.DELETE("/:id", admin.DeleteRole)
        }

        rolePermissionRoutes := adminRoutes.Group("/role-permissions")
        {
            rolePermissionRoutes.GET("/", admin.GetAllRolePermissions)
            rolePermissionRoutes.POST("/", admin.CreateRolePermission)
            rolePermissionRoutes.PUT("/:id", admin.UpdateRolePermission)
            rolePermissionRoutes.DELETE("/:id", admin.DeleteRolePermission)
            rolePermissionRoutes.GET("/list", admin.RolePermissionHandler)
            rolePermissionRoutes.PUT("/update", admin.UpdateRolePermissionHandler)
        }

        actionTypeRoutes := adminRoutes.Group("/action-types")
        {
            actionTypeRoutes.GET("/", admin.GetAllActionTypes)
            actionTypeRoutes.POST("/", admin.CreateActionType)
            actionTypeRoutes.PUT("/:id", admin.UpdateActionType)
            actionTypeRoutes.DELETE("/:id", admin.DeleteActionType)
        }
    }

    protectedRoutes := router.Group("/protected")
    {
        departmentRoutes := protectedRoutes.Group("/departments")
        {
            departmentRoutes.GET("/", protected.GetAllDepartments)
            departmentRoutes.POST("/", protected.CreateDepartment)
            departmentRoutes.PUT("/:id", protected.UpdateDepartment)
            departmentRoutes.DELETE("/:id", protected.DeleteDepartment)
        }

        userDepartmentRoutes := protectedRoutes.Group("/user/departments")
        {
            userDepartmentRoutes.GET("/", protected.GetAllUserDepartments)
            userDepartmentRoutes.POST("/", protected.CreateUserDepartment)
            userDepartmentRoutes.PUT("/:id", protected.UpdateUserDepartment)
            userDepartmentRoutes.DELETE("/:id", protected.DeleteUserDepartment)
            userDepartmentRoutes.GET("/list", protected.UserDepartmentHandler)
            userDepartmentRoutes.PUT("/update", protected.UpdateUserDepartmentHandler)
        }
        taskRoutes := protectedRoutes.Group("/tasks")
        {
            taskRoutes.GET("/", protected.GetAllTasks)
            taskRoutes.POST("/", protected.CreateTask)
            taskRoutes.PUT("/:id", protected.UpdateTask)
            taskRoutes.DELETE("/:id", protected.DeleteTask)
            taskRoutes.GET("/check-task-id", protected.CheckTaskIDExists)
        }
        projectRoutes := protectedRoutes.Group("/projects")
        {
            projectRoutes.GET("/", protected.GetAllProjects)
            projectRoutes.POST("/", protected.CreateProject)
            projectRoutes.PUT("/:id", protected.UpdateProject)
            projectRoutes.DELETE("/:id", protected.DeleteProject)
            projectRoutes.GET("/tasks/:id", protected.GetAllProjectTasks)

        }
        kpiRoutes := protectedRoutes.Group("/kpi")
        {
            kpiRoutes.GET("/kpi", protected.GetAllKPIs)
	        kpiRoutes.GET("/kpi/:id", protected.GetKPI)
	        // kpiRoutes.POST("/kpi", protected.CreateKPI)
	        // kpiRoutes.PUT("/kpi/:id", protected.UpdateKPI)
	        // kpiRoutes.DELETE("/kpi/:id", protected.DeleteKPI)

        }
    }

}