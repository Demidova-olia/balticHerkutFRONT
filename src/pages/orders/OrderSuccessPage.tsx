// src/pages/order/OrderSuccessPage.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './OrderSuccessPage.module.css';
import NavBar from '../../components/NavBar/NavBar';

const OrderSuccessPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <NavBar />
      <main className={styles.page} role="main">
        <h1 className={styles.heading}>
          {t('order.success.title', 'Thank you! Your order has been received.')}
        </h1>

        <Link
          to="/"
          className={styles.button}
          aria-label={t('order.success.backHome', 'Back to Home')}
        >
          {t('order.success.backHome', 'Back to Home')}
        </Link>
      </main>
    </>
  );
};

export default OrderSuccessPage;

