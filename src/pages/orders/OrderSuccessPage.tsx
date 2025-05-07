import { Link } from 'react-router-dom'

const OrderSuccessPage = () => {
    return (
        <div className="order-success-page">
            <h1>Ačiū! Užsakymas gautas</h1>
            <Link to="/" className="back-to-home-button">
                Grįžti į pradžią
            </Link>
        </div>
    )
}

export default OrderSuccessPage 
