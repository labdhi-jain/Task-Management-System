import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, CheckCircle, AlignLeft, Type, ArrowRight, Clock } from 'lucide-react';
import Alert from './Alert';

const TaskModal = ({ isOpen, onClose, onSave, taskToEdit = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setStatus(taskToEdit.status || 'Pending');
      setDueTime(taskToEdit.dueTime || '');
      // Format due date to YYYY-MM-DD for HTML input[type="date"]
      if (taskToEdit.dueDate) {
        const formattedDate = new Date(taskToEdit.dueDate)
          .toISOString()
          .split('T')[0];
        setDueDate(formattedDate);
      } else {
        setDueDate('');
      }
    } else {
      // Default new task values
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('Pending');
      setDueTime('');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    setLoading(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate,
        dueTime: dueTime || '',
      });
      onClose();
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to save task. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--bg-glass-border)',
          }}
        >
          <h2 style={{ fontSize: '1.4rem' }}>
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        <Alert type="error" message={error} />

        {/* Modal Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              <span>Task Title *</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="task-title"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
              <Type
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
            <label className="form-label" htmlFor="task-description">
              <span>Description (Optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                id="task-description"
                className="form-textarea"
                style={{ minHeight: '90px', paddingLeft: '2.5rem' }}
                placeholder="Add any extra details, notes, or sub-items..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
              <AlignLeft
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '1rem',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>

          {/* Grid for Priority and Status */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                <span>Priority</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="task-priority"
                  className="form-select"
                  style={{ paddingLeft: '2.5rem' }}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={loading}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <Flag
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
              <label className="form-label" htmlFor="task-status">
                <span>Status</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="task-status"
                  className="form-select"
                  style={{ paddingLeft: '2.5rem' }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <CheckCircle
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
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">
                <span>Due Date *</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="task-due-date"
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  disabled={loading}
                />
                <Calendar
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
              <label className="form-label" htmlFor="task-due-time">
                <span>Due Time (Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="task-due-time"
                  type="time"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  disabled={loading}
                />
                <Clock
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
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
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
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
