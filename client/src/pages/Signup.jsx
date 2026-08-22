import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                login(data.user, data.token);
                navigate('/');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Signup failed. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2>Sign Up for GlobeTrotter</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Full Name" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
                <button type="submit" style={{ padding: '12px', background: '#3498DB', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</button>
            </form>
            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Already have an account? <Link to="/login" style={{ color: '#3498DB', textDecoration: 'none' }}>Login</Link>
            </p>
        </div>
    );
};

export default Signup;
