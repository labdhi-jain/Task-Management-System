import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--bg-glass-border)',
        padding: '1.5rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-primary)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <span>
          © {new Date().getFullYear()} <strong>TaskFlow</strong>. Built by <strong>Labdhi Jain</strong>.
          
        </span>
        
      </div>
    </footer>
  );
};

export default Footer;
