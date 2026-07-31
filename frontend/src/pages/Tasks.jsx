import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import TaskModal from '../components/TaskModal';
import DeleteModal from '../components/DeleteModal';
import Alert from '../components/Alert';
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight,
  ListTodo,
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Search, Filter, Sort & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc = earliest due date
  const [limit, setLimit] = useState(10);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch tasks with parameters
  const fetchTasks = useCallback(
    async (pageNumber = currentPage) => {
      setLoading(true);
      setError('');
      try {
        const params = {
          page: pageNumber,
          limit,
          sortBy: 'dueDate',
          order: sortOrder,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (statusFilter) {
          params.status = statusFilter;
        }

        if (priorityFilter) {
          params.priority = priorityFilter;
        }

        const res = await api.get('/tasks', { params });
        if (res.data && res.data.success) {
          setTasks(res.data.tasks);
          setTotalTasks(res.data.totalTasks);
          setTotalPages(res.data.totalPages);
          setCurrentPage(res.data.currentPage);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please refresh.');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, limit, searchQuery, statusFilter, priorityFilter, sortOrder]
  );

  useEffect(() => {
    fetchTasks(1);
  }, [limit, searchQuery, statusFilter, priorityFilter, sortOrder]);

  // Handle Create / Update Task via Modal
  const handleSaveTask = async (taskData) => {
    if (taskToEdit) {
      // Update existing task
      await api.put(`/tasks/${taskToEdit._id}`, taskData);
    } else {
      // Create new task
      await api.post('/tasks', taskData);
    }
    fetchTasks(currentPage);
  };

  // Handle Delete Task via Modal
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    await api.delete(`/tasks/${taskToDelete._id}`);
    // If we deleted the last task on this page, move back a page if possible
    if (tasks.length === 1 && currentPage > 1) {
      fetchTasks(currentPage - 1);
    } else {
      fetchTasks(currentPage);
    }
  };

  // Quick Status Toggle (Bonus UX Feature)
  const handleQuickStatusToggle = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      // Optimistically update local state
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === task._id ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update task status.');
      fetchTasks(currentPage);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Format date cleanly
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status icon helper
  const getStatusIcon = (status) => {
    if (status === 'Completed') return <CheckCircle2 size={16} />;
    if (status === 'In Progress') return <Activity size={16} />;
    return <Clock size={16} />;
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header & Create Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            My Task Workspace
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Create, filter, sort, and manage all your tasks efficiently.
          </p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <PlusCircle size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {/* Search Title */}
        <div style={{ position: 'relative', gridColumn: 'span 1' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem', height: '42px' }}
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
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

        {/* Filter by Status */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-select"
            style={{ paddingLeft: '2.5rem', height: '42px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <Filter
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

        {/* Filter by Priority */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-select"
            style={{ paddingLeft: '2.5rem', height: '42px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <Filter
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

        {/* Sort by Due Date */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-select"
            style={{ paddingLeft: '2.5rem', height: '42px' }}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Due Date: Earliest First</option>
            <option value="desc">Due Date: Latest First</option>
          </select>
          <ArrowUpDown
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

        {/* Reset Filters */}
        <div>
          <button
            onClick={handleResetFilters}
            className="btn btn-secondary"
            style={{
              width: '100%',
              height: '42px',
              justifyContent: 'center',
            }}
            title="Reset all filters and search"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      <Alert type="error" message={error} />

      {/* Task List / Cards View */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div className="spinner" style={{ marginBottom: '1rem' }}>
            Loading tasks...
          </div>
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            maxWidth: '520px',
            margin: '2rem auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--color-primary-glow)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              marginBottom: '1.25rem',
            }}
          >
            <ListTodo size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            No matching tasks found
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              marginBottom: '1.75rem',
            }}
          >
            We couldn't find any tasks matching your current filters or search
            query. Create a new task or try clearing your filters.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <PlusCircle size={18} />
              <span>Create First Task</span>
            </button>
            {(searchQuery || statusFilter || priorityFilter) && (
              <button onClick={handleResetFilters} className="btn btn-secondary">
                <RotateCcw size={16} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Tasks List Grid */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {tasks.map((task) => (
            <div
              key={task._id}
              className="glass-card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                borderLeft: `4px solid ${
                  task.priority === 'High'
                    ? 'var(--color-danger)'
                    : task.priority === 'Medium'
                    ? 'var(--color-warning)'
                    : 'var(--color-success)'
                }`,
              }}
            >
              {/* Task Title & Description */}
              <div style={{ flex: '1 1 300px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.4rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      textDecoration:
                        task.status === 'Completed' ? 'line-through' : 'none',
                      color:
                        task.status === 'Completed'
                          ? 'var(--text-muted)'
                          : 'var(--text-primary)',
                    }}
                  >
                    {task.title}
                  </h3>

                  {/* Priority Badge */}
                  <span
                    className={`badge badge-priority-${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>
                </div>

                {task.description && (
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.65rem',
                    }}
                  >
                    {task.description}
                  </p>
                )}

                {/* Due Date Indicator */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Calendar size={15} />
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
              </div>

              {/* Status Quick Dropdown Selector (Bonus Feature) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleQuickStatusToggle(task, e.target.value)
                    }
                    className="form-select"
                    style={{
                      paddingTop: '0.35rem',
                      paddingBottom: '0.35rem',
                      paddingLeft: '0.75rem',
                      paddingRight: '2rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-full)',
                      background:
                        task.status === 'Completed'
                          ? 'hsla(150, 70%, 45%, 0.15)'
                          : task.status === 'In Progress'
                          ? 'hsla(250, 84%, 67%, 0.15)'
                          : 'hsla(38, 92%, 55%, 0.15)',
                      color:
                        task.status === 'Completed'
                          ? 'var(--color-success)'
                          : task.status === 'In Progress'
                          ? 'var(--color-primary)'
                          : 'var(--color-warning)',
                      border: '1px solid var(--bg-glass-border)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Actions (Edit & Delete buttons) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => {
                      setTaskToEdit(task);
                      setIsTaskModalOpen(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    title="Edit task"
                    style={{ padding: '0.45rem' }}
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setTaskToDelete(task);
                      setIsDeleteModalOpen(true);
                    }}
                    className="btn btn-danger btn-sm"
                    title="Delete task"
                    style={{ padding: '0.45rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls (Bonus Feature) */}
      {totalTasks > 0 && (
        <div className="pagination-container">
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Showing{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {tasks.length}
            </strong>{' '}
            of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {totalTasks}
            </strong>{' '}
            tasks (Page {currentPage} of {totalPages})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Page Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Per page:
              </span>
              <select
                className="form-select"
                style={{
                  width: 'auto',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.85rem',
                }}
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page Buttons */}
            <div className="pagination-controls">
              <button
                onClick={() => fetchTasks(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="page-btn"
                title="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchTasks(page)}
                  disabled={loading}
                  className={`page-btn ${page === currentPage ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => fetchTasks(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="page-btn"
                title="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onDelete={handleDeleteTask}
        taskTitle={taskToDelete ? taskToDelete.title : ''}
      />
    </div>
  );
};

export default Tasks;
