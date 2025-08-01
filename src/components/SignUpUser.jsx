import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';

const SignUpUser = () => {
  const { session } = useAuth(); // 👈 assuming AuthProvider gives you session (access_token)

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cbAdminCode, setCbAdminCode] = useState('CB');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        'https://mvvzqouqxrtyzuzqbeud.supabase.co/functions/v1/create-cb-admin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && {
              Authorization: `Bearer ${session.access_token}`,
            }),
          },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            phone,
            cb_admin_code: cbAdminCode,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed.');
      }

      setMessage('CB Admin created successfully!');
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
      setCbAdminCode('CB');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Create CB Admin</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Phone:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>CB Admin Code:</label>
          <input
            type="text"
            value={cbAdminCode}
            onChange={(e) => setCbAdminCode(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create CB Admin'}
        </button>
      </form>
      {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
    </div>
  );
};

export default SignUpUser;
