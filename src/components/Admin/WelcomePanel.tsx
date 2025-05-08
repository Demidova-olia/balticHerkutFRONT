import { Card, CardContent, Typography, Box } from "@mui/material"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import { useAuth } from "../../hooks/useAuth"

const WelcomePanel: React.FC = () => {
    const { user } = useAuth()
    const username = user?.username || "Admin"

    return (
        <Box display="flex" justifyContent="center" mt={4}>
            <Card
                sx={{
                    maxWidth: 600,
                    width: "100%",
                    p: 3,
                    borderRadius: 4,
                    boxShadow: 3,
                    backgroundColor: "#f9f9f9",
                }}
            >
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <AdminPanelSettingsIcon fontSize="large" color="primary" />
                    <Box>
                        <Typography variant="h5" component="div" fontWeight="bold">
                            Welcome back, {username}!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You're now logged in to the admin dashboard.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}

export default WelcomePanel
