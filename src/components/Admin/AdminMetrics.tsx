import { useEffect, useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import axiosInstance from "../../utils/axios"

const AdminMetrics: React.FC = () => {
    const { user } = useAuth()

    const [totalOrders, setTotalOrders] = useState(0)
    const [revenue, setRevenue] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await axiosInstance.get('/admin/stats')
                console.log("Received data:", response.data)

                setTotalOrders(response.data.totalOrders)
                setRevenue(response.data.totalRevenue || 0)
                console.log("Updated totalOrders:", response.data.totalOrders)
                console.log("Updated revenue:", response.data.totalRevenue)
            } catch (error: unknown) {
                console.error("Error fetching data:", error)
                setError('Failed to fetch data')
            } finally {
                setLoading(false)
            }
        }

        if (user?.role === 'ADMIN') {
            fetchData()
        }
    }, [user])

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div className="admin-metrics">
            <h1>Admin Statistics</h1>
            {error ? (
                <p className="error">{error}</p>
            ) : totalOrders === 0 && revenue === 0 ? (
                <p>Loading...</p>
            ) : (
                <>
                    <p><strong>Total Orders: </strong>{totalOrders}</p>
                    <p><strong>Total Revenue: </strong>{(revenue ?? 0).toFixed(2)} €</p>
                </>
            )}
        </div>
    )
}

export default AdminMetrics
