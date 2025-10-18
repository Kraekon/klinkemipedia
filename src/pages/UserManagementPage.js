import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Alert, Spinner, Form } from 'react-bootstrap';
import AdminNavbar from '../components/AdminNavbar';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/api';
import './Admin.css';

const USER_ROLES = ['user', 'contributor', 'admin'];

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    profile: {
      firstName: '',
      lastName: '',
      specialty: '',
      institution: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers({ limit: 100 });
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      profile: {
        firstName: '',
        lastName: '',
        specialty: '',
        institution: ''
      }
    });
    setFormErrors({});
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setCurrentUser(user);
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // Don't populate password for edit
        role: user.role,
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          specialty: user.profile?.specialty || '',
          institution: user.profile?.institution || ''
        }
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    resetForm();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (modalMode === 'create' && !formData.password) {
      errors.password = 'Password is required';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare submit data
      const submitData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        profile: formData.profile
      };

      // Only include password if it's provided
      if (formData.password) {
        submitData.password = formData.password;
      }

      if (modalMode === 'create') {
        await createUser(submitData);
        setSuccess('User created successfully');
      } else {
        await updateUser(currentUser._id, submitData);
        setSuccess('User updated successfully');
      }

      handleCloseModal();
      fetchUsers();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    try {
      setLoading(true);
      await deleteUser(deleteModal.user._id);
      setSuccess(`User "${deleteModal.user.username}" deleted successfully`);
      setDeleteModal({ show: false, user: null });
      fetchUsers();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      contributor: 'primary',
      user: 'secondary'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !roleFilter || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });

  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2>User Management</h2>
            <div className="article-count">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => handleOpenModal('create')}
          >
            + Create New User
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <div className="mb-3 d-flex gap-3 align-items-end">
          <Form.Group className="flex-grow-1">
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          <Form.Group style={{ minWidth: '150px' }}>
            <Form.Label>Filter by Role</Form.Label>
            <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {USER_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>

        {loading && users.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>No users found</h3>
            <p>{searchTerm || roleFilter ? 'Try adjusting your filters' : 'Create your first user to get started!'}</p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => handleOpenModal('create')}
            >
              + Create New User
            </Button>
          </div>
        ) : (
          <div className="admin-table">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Institution</th>
                  <th>Created</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td><strong>{user.username}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      {user.profile?.firstName || user.profile?.lastName
                        ? `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim()
                        : '-'}
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{user.profile?.institution || '-'}</td>
                    <td className="text-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenModal('edit', user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteModal({ show: true, user })}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'create' ? 'Create New User' : 'Edit User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                isInvalid={!!formErrors.username}
                placeholder="Enter username"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                isInvalid={!!formErrors.email}
                placeholder="Enter email"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Password {modalMode === 'create' && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                isInvalid={!!formErrors.password}
                placeholder={modalMode === 'edit' ? 'Leave blank to keep current password' : 'Enter password'}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.password}
              </Form.Control.Feedback>
              {modalMode === 'edit' && (
                <Form.Text muted>
                  Leave blank to keep the current password
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {USER_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <hr />
            <h5>Profile Information (Optional)</h5>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.profile.firstName}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, firstName: e.target.value }
                    })}
                    placeholder="Enter first name"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.profile.lastName}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, lastName: e.target.value }
                    })}
                    placeholder="Enter last name"
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Specialty</Form.Label>
              <Form.Control
                type="text"
                value={formData.profile.specialty}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: { ...formData.profile, specialty: e.target.value }
                })}
                placeholder="e.g., Clinical Chemistry, Hematology"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Institution</Form.Label>
              <Form.Control
                type="text"
                value={formData.profile.institution}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: { ...formData.profile, institution: e.target.value }
                })}
                placeholder="Enter institution name"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : modalMode === 'create' ? 'Create User' : 'Update User'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, user: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the user <strong>{deleteModal.user?.username}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, user: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserManagementPage;
