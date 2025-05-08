import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';
import styles from './Register.module.css'; // Import the CSS Module

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    phoneNumber: '' // Добавляем phoneNumber в состояние
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username || !formData.phoneNumber) {
      toast.error('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending data:', {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        phoneNumber: formData.phoneNumber // Передаем phoneNumber
      });

      const response = await axiosInstance.post('/users/register', {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        phoneNumber: formData.phoneNumber // Добавляем phoneNumber в запрос
      });

      console.log('Server response:', response.data);
      toast.success('Registration successful! You can now log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        console.error('Server response:', axiosError.response?.data);
        toast.error(axiosError.response?.data?.message || 'Registration error');
      } else {
        toast.error('Registration error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Register</h1>
      <form onSubmit={handleSubmit} className={styles.formWrapper}>
        <div>
          <label htmlFor="username" className={styles.label}>Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className={styles.inputField}
          />
        </div>
        <div>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.inputField}
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className={styles.label}>Phone Number:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className={styles.inputField}
          />
        </div>
        <div>
          <label htmlFor="password" className={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className={styles.inputField}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            className={styles.inputField}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={styles.button}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className={styles.footerText}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
      <div className={styles.returnLinkWrapper}>
        <Link to="/home" className={styles.returnLink}> Return to Home Page</Link>
      </div>
    </div>
  );
}

export default Register;
