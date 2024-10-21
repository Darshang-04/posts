import { useState } from 'react';
import styles from '@/styles/auth.module.css';
import { useRouter } from 'next/router';

export default function Signup() {
  const [form, setForm] = useState({ name: '', username: '',email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError('');
    setSuccess('');

    // Send data to the API
    try {
      const res = await fetch('https://backend-ibub.onrender.com/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.status === 201) {
        setSuccess(data.message);
        setForm({ name: '', username: '',email: '', password: '' });
        router.push('/auth/signin')
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h1 className={styles.h1}>Sign Up</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.element}>
          <label className={styles.title}>Name </label>
          <input
            className={styles.input}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.element}>
          <label className={styles.title}>UserName</label>
          <input
            className={styles.input}
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.element}>
          <label className={styles.title}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.element}>
          <label className={styles.title}>Password</label>
          <input
            className={styles.input}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button className={styles.button} type="submit">Sign Up</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}
