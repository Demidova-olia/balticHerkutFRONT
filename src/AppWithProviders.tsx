import { CartProvider } from './contexts/CartContext'
import { useAuth } from './hooks/useAuth'
import App from './App'

const AppWithProviders = () => {
  const { user } = useAuth()

  return (
    <CartProvider key={user?.id || 'guest'} userId={user?.id || 'guest'}>
      <App />
    </CartProvider>
  )
}

export default AppWithProviders