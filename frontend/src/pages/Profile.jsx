import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { User, Mail, Lock, CheckCircle2, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Comprehensive email format & real-world username validation
  const isValidEmail = (value) => {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      return false;
    }
    const username = value.split('@')[0].toLowerCase();

    // Block obvious fake, test, sequential, or placeholder usernames
    const blocklistedNames = [
      'abcdef', 'abcdefg', 'abcdefgh', '123456', '1234567', '12345678',
      'qwerty', 'qwertyuiop', 'asdfgh', 'asdfghjkl', 'test', 'tester',
      'testuser', 'sample', 'dummy', 'fake', 'nobody', 'temp', 'admin',
      'root', 'user123', 'aaa', 'bbb', 'ccc', 'abc', 'xyz', 'foo', 'bar',
      'abcde', '12345', 'qwert', 'asdfg'
    ];
    if (blocklistedNames.includes(username)) {
      return false;
    }

    // Check for 6+ sequential alphabet characters (e.g. abcdef, bcdefg)
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i <= alphabet.length - 6; i++) {
      if (username.includes(alphabet.slice(i, i + 6))) {
        return false;
      }
    }

    // Check for 6+ sequential number characters (e.g. 012345, 123456)
    const digits = '0123456789';
    for (let i = 0; i <= digits.length - 6; i++) {
      if (username.includes(digits.slice(i, i + 6))) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid, existing email address. Test, sequential, or placeholder emails are not allowed.');
      return;
    }

    if (password && password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };
      if (password) {
        payload.password = password;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        setSuccessMsg('🎉 Profile updated successfully!');
        setPassword('');
      }
    } catch (err) {
      let message = 'Failed to update profile. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        maxWidth: '680px',
        margin: '2rem auto',
        padding: '0 1rem',
      }}
    >
      {/* Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/dashboard"
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Account Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your personal details and account preferences.
        </p>
      </div>

      <Alert message={error} type="error" onClose={() => setError('')} />

      {successMsg && (
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--color-success)',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Card Form */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="name"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
              Note: Changing email address will require validation against our DNS server.
            </span>
          </div>

          {/* Password (Optional) */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" htmlFor="password">
              New Password (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--bg-glass-border)',
            }}
          >
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
