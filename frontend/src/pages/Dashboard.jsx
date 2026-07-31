import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';
import TaskModal from '../components/TaskModal';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    byPriority: {
      High: 0,
      Medium: 0,
      Low: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleSaveTask = async (taskData) => {
    await api.post('/tasks', taskData);
    fetchStats();
  };

  const fetchStats = async () => {
    try {
      setError('');
      const res = await api.get('/tasks/stats');
      if (res.data && res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  // Calculate percentage helper
  const calculatePercentage = (count) => {
    if (!stats.totalTasks || stats.totalTasks === 0) return 0;
    return Math.round((count / stats.totalTasks) * 100);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Personalized Greeting Header */}
      <div
        className="glass-card"
        style={{
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          background:
            'linear-gradient(135deg, var(--bg-glass), hsla(250, 80%, 65%, 0.12))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary-glow)',
              color: 'var(--color-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}
          >
            Productivity Overview
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            Welcome, {user ? user.name : 'User'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px' }}>
            Here is a real-time overview of your task list, progress, and priority items today.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/tasks" className="btn btn-primary">
            <span>Manage Tasks</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      <Alert type="error" message={error} />

      {/* Stat Cards Grid (Requirements: Total, Completed, Pending) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Total Tasks Card */}
        <div
          className="glass-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Total Tasks
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--color-primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <CheckSquare size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {loading ? '...' : stats.totalTasks}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
            }}
          >
            All registered tasks
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div
          className="glass-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderLeft: '4px solid var(--color-success)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Completed Tasks
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'hsla(150, 70%, 45%, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {loading ? '...' : stats.completedTasks}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-success)',
              fontWeight: 600,
              marginTop: '0.25rem',
            }}
          >
            {calculatePercentage(stats.completedTasks)}% completion rate
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div
          className="glass-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderLeft: '4px solid var(--color-warning)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Pending Tasks
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'hsla(38, 92%, 55%, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-warning)',
              }}
            >
              <Clock size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {loading ? '...' : stats.pendingTasks}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
            }}
          >
            Waiting to be started
          </div>
        </div>

        {/* In Progress Tasks Card (Bonus Stat) */}
        <div
          className="glass-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderLeft: '4px solid hsl(200, 80%, 55%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              In Progress
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'hsla(200, 80%, 55%, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(200, 80%, 55%)',
              }}
            >
              <Activity size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {loading ? '...' : stats.inProgressTasks}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
            }}
          >
            Actively being worked on
          </div>
        </div>
      </div>

      {/* Analytics Breakdown & Quick Links Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Priority Distribution Card */}
        <div className="glass-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.5rem',
            }}
          >
            <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>Priority Distribution</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* High Priority */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ color: 'var(--color-danger)' }}>High Priority</span>
                <span>
                  {stats.byPriority.High} (
                  {calculatePercentage(stats.byPriority.High)}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'var(--bg-tertiary)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${calculatePercentage(stats.byPriority.High)}%`,
                    height: '100%',
                    background: 'var(--color-danger)',
                    transition: 'width 500ms ease',
                  }}
                />
              </div>
            </div>

            {/* Medium Priority */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ color: 'var(--color-warning)' }}>Medium Priority</span>
                <span>
                  {stats.byPriority.Medium} (
                  {calculatePercentage(stats.byPriority.Medium)}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'var(--bg-tertiary)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${calculatePercentage(stats.byPriority.Medium)}%`,
                    height: '100%',
                    background: 'var(--color-warning)',
                    transition: 'width 500ms ease',
                  }}
                />
              </div>
            </div>

            {/* Low Priority */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ color: 'var(--color-success)' }}>Low Priority</span>
                <span>
                  {stats.byPriority.Low} (
                  {calculatePercentage(stats.byPriority.Low)}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'var(--bg-tertiary)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${calculatePercentage(stats.byPriority.Low)}%`,
                    height: '100%',
                    background: 'var(--color-success)',
                    transition: 'width 500ms ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action & Tips Widget */}
        <div
          className="glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1rem',
              }}
            >
              <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
              <h2 style={{ fontSize: '1.25rem' }}>Quick Actions</h2>
            </div>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              Need to create a new task, search by title, or filter high priority
              items? Jump directly to your Tasks workspace to manage your items.
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
                Ready to get things done?
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Create, filter, sort & paginate tasks
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <PlusCircle size={16} />
                <span>Add Task</span>
              </button>
              <Link to="/tasks" className="btn btn-secondary">
                <span>Open Tasks</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={null}
      />
    </div>
  );
};

export default Dashboard;
