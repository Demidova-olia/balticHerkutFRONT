import { Link } from 'react-router-dom';
import styles from './OrderSuccessPage.module.css';
import NavBar from '../../components/NavBar/NavBar';

const OrderSuccessPage = () => {
    return (
        <>
            <NavBar/>
            <div className={styles.page}>
                <h1 className={styles.heading}>Thank you! Your order has been received.</h1>
                <Link to="/" className={styles.button}>
                    Back to Home
                </Link>
            </div>
        </>
    );
};

export default OrderSuccessPage;
