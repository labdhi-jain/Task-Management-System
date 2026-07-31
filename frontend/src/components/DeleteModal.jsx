import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import Alert from './Alert';

const DeleteModal = ({ isOpen, onClose, onDelete, taskTitle = 'this task' }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError('');
    setLoading(true);

    try {
      await onDelete();
      onClose();
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to delete task. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              color: 'var(--color-danger)',
            }}
          >
            <AlertTriangle size={24} />
            <h3 style={{ fontSize: '1.25rem' }}>Confirm Deletion</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <Alert type="error" message={error} />

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          Are you sure you want to permanently remove{' '}
          <strong style={{ color: 'var(--text-primary)' }}>"{taskTitle}"</strong>?
          This action cannot be undone.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--bg-glass-border)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? (
              <span>Deleting...</span>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Task</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
