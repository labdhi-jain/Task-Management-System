import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation helper (Bonus UI/UX)
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8 && /[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

    if (score === 0)
      return { level: 1, label: 'Too short', color: 'var(--color-danger)' };
    if (score === 1)
      return { level: 1, label: 'Weak', color: 'var(--color-danger)' };
    if (score === 2)
      return { level: 2, label: 'Medium', color: 'var(--color-warning)' };
    return { level: 3, label: 'Strong', color: 'var(--color-success)' };
  };

  const strength = getPasswordStrength();

  // Comprehensive email format & real-world username validation
  const isValidEmail = (value) => {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      return false;
    }
    const username = value.split('@')[0].toLowerCase();

    // Block obvious fake, test, sequential, or placeholder usernames (e.g. abcdef@gmail.com)
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

  // Real-time email status (computed every render)
  const emailStatus = (() => {
    if (!email) return { valid: null, message: '' };
    if (isValidEmail(email.trim())) return { valid: true, message: 'Valid email format' };
    return { valid: false, message: 'Enter a real email (test/sequential emails like abcdef@... are not allowed)' };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid, existing email address. Test, sequential, or placeholder emails (like abcdef@...) are not allowed.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      let message;
      if (!err.response) {
        message = 'Cannot connect to the server. Make sure the backend is running (npm run dev) and MongoDB is connected.';
      } else if (err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else {
        message = 'Registration failed. Please try again.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 180px)',
        padding: '1rem',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--color-primary-glow)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              marginBottom: '1rem',
            }}
          >
            <UserPlus size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>
            Create an Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Start organizing your tasks with TaskFlow
          </p>
        </div>

        {/* Error Alert */}
        <Alert type="error" message={error} />

        {/* Signup Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-name"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-email"
                type="email"
                className="form-input"
                style={{
                  paddingLeft: '2.5rem',
                  borderColor:
                    email && emailStatus.valid === false
                      ? 'var(--color-danger)'
                      : email && emailStatus.valid === true
                      ? 'var(--color-success)'
                      : undefined,
                }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
            {/* Real-time email validation indicator */}
            {email && (
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginTop: '0.3rem',
                  color: emailStatus.valid
                    ? 'var(--color-success)'
                    : 'var(--color-danger)',
                }}
              >
                {emailStatus.message}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div style={{ marginTop: '0.4rem' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    height: '4px',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        background:
                          strength.level >= step
                            ? strength.color
                            : 'var(--bg-tertiary)',
                        transition: 'background 200ms ease',
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                    color: strength.color,
                    fontWeight: 600,
                  }}
                >
                  <span>Strength</span>
                  <span>{strength.label}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--bg-glass-border)',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--color-primary)',
              fontWeight: 600,
              marginLeft: '0.25rem',
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
