package routes

import (
	"github.com/amgaland/epes/epes-back/controllers"
	admin "github.com/amgaland/epes/epes-back/controllers/admin"
	api "github.com/amgaland/epes/epes-back/controllers/api"
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

}