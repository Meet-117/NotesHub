import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await createUser({ name, email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-secondary)' }}>
      <div style={{ background: 'var(--surface)', padding: 40, borderRadius: 12, border: '1px solid var(--border)', width: 400, maxWidth: '90%' }}>
        <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Create an account</h2>
        <p style={{ marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>Join NotesHub today</p>
        
        <form onSubmit={handleSignup}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="input-label">Username</label>
            <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="input-label">Email address</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="input-label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
