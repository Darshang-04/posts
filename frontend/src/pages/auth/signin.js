import { useState } from 'react';
import styles from '@/styles/auth.module.css'; // Update this import
import { useRouter } from 'next/router';

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('https://backend-ibub.onrender.com/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.status === 200) {
        setSuccess(data.msg);
        setForm({ email: '', password: '' });
        localStorage.setItem('token', data.token);
        router.push('/');
      } else {
        setError(data.err);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h1 className={styles.h1}>Sign In</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className=''>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
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
        <button className={styles.button} type="submit">Sign In</button>
      </form>
    </div>
  );
}
