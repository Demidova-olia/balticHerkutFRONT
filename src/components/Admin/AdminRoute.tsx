import { useAuth } from "../../hooks/useAuth"
import { Navigate, Outlet } from "react-router-dom"
import { useEffect } from "react"
import { toast } from "react-toastify"

const AdminRoute: React.FC = () => {
    const { user, isAuthenticated } = useAuth()

    useEffect(() => {
        console.log("AdminRoute - User:", user)
        console.log("AdminRoute - IsAuthenticated:", isAuthenticated)

        if (isAuthenticated && user && user.role !== "ADMIN") {
            console.log("AdminRoute - User role:", user.role)
            toast.error("You do not have permission to view this page")
        }
    }, [isAuthenticated, user])

    if (!isAuthenticated) {
        return <div>Loading...</div>
    }

    if (!user) {
        console.log("AdminRoute - No user found")
        return <Navigate to="/login" replace />
    }

    if (user.role !== "ADMIN") {
        console.log("AdminRoute - User is not admin, role:", user.role)
        return <Navigate to="/" replace />
    }

    console.log("AdminRoute - Access granted")
    return <Outlet />
}

export default AdminRoute
