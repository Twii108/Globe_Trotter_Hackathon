import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, token, logout, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [message, setMessage] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                setMessage('Profile updated successfully!');
            } else {
                setMessage(data.error || 'Update failed');
            }
        } catch (err) {
            setMessage('Error updating profile');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const res = await fetch('/api/users/me', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    logout();
                    navigate('/login');
                }
            } catch (err) {
                setMessage('Error deleting account');
            }
        }
    };

    if (!user) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#2C3E50' }}>Your Profile Settings</h2>
            {message && <p style={{ color: '#3498DB', fontWeight: 'bold' }}>{message}</p>}
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px', marginTop: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Full Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                    />
                </div>
                <button type="submit" style={{ padding: '12px', background: '#3498DB', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Update Profile</button>
            </form>

            <div style={{ marginBottom: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <h3 style={{ color: '#2C3E50', marginTop: 0 }}>Saved Destinations</h3>
                <p style={{ color: '#6c757d', fontStyle: 'italic' }}>You haven't saved any destinations yet.</p>
                {/* Other members will render the actual grid here */}
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h3 style={{ color: '#e74c3c' }}>Danger Zone</h3>
                <p style={{ color: '#6c757d', marginBottom: '15px' }}>Once you delete your account, there is no going back. Please be certain.</p>
                <button onClick={handleDelete} style={{ padding: '10px 15px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete Account</button>
            </div>
        </div>
    );
};

export default Profile;
