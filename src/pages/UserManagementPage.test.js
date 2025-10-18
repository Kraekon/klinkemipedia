import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserManagementPage from './UserManagementPage';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <UserManagementPage />
    </BrowserRouter>
  );
};

const mockUsers = [
  {
    _id: '1',
    username: 'testuser1',
    email: 'test1@example.com',
    role: 'admin',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      specialty: 'Clinical Chemistry',
      institution: 'Test Hospital'
    },
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '2',
    username: 'testuser2',
    email: 'test2@example.com',
    role: 'contributor',
    profile: {
      firstName: 'Jane',
      lastName: 'Smith'
    },
    createdAt: '2024-01-02T00:00:00.000Z'
  }
];

describe('UserManagementPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading spinner while fetching users', () => {
    api.getAllUsers.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter();
    
    expect(screen.getByText(/Loading users.../i)).toBeInTheDocument();
  });

  test('displays users table when users are loaded', async () => {
    api.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
      expect(screen.getByText('testuser2')).toBeInTheDocument();
      expect(screen.getByText('test1@example.com')).toBeInTheDocument();
      expect(screen.getByText('test2@example.com')).toBeInTheDocument();
    });
  });

  test('displays user count correctly', async () => {
    api.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('2 users')).toBeInTheDocument();
    });
  });

  test('shows empty state when no users exist', async () => {
    api.getAllUsers.mockResolvedValue({ data: [], total: 0 });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.getByText(/Create your first user to get started/i)).toBeInTheDocument();
    });
  });

  test('displays error message on fetch failure', async () => {
    api.getAllUsers.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('filters users by search term', async () => {
    api.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by username, email, or name/i);
    fireEvent.change(searchInput, { target: { value: 'testuser1' } });

    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
      expect(screen.queryByText('testuser2')).not.toBeInTheDocument();
    });
  });

  test('filters users by role', async () => {
    api.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
      expect(screen.getByText('testuser2')).toBeInTheDocument();
    });

    const roleSelects = screen.getAllByRole('combobox');
    const roleFilter = roleSelects.find(select => 
      select.closest('div')?.querySelector('label')?.textContent === 'Filter by Role'
    );
    fireEvent.change(roleFilter, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
      expect(screen.queryByText('testuser2')).not.toBeInTheDocument();
    });
  });

  test('opens create user modal when Create New User button is clicked', async () => {
    api.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
    });

    const createButton = screen.getAllByText(/Create New User/i)[0];
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Create New User')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    });
  });

  test('opens edit user modal when Edit button is clicked', async () => {
    api.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('testuser1')).toBeInTheDocument();
    });
  });

  test('shows delete confirmation modal when Delete button is clicked', async () => {
    api.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete the user/i)).toBeInTheDocument();
    });
  });

  test('validates required fields when creating user', async () => {
    api.getAllUsers.mockResolvedValue({ data: [], total: 0 });
    
    renderWithRouter();
    
    await waitFor(() => {
      const createButton = screen.getByText(/Create New User/i);
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      const submitButton = screen.getByText('Create User');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('creates new user successfully', async () => {
    api.getAllUsers.mockResolvedValue({ data: [], total: 0 });
    api.createUser.mockResolvedValue({ data: mockUsers[0] });
    
    renderWithRouter();
    
    await waitFor(() => {
      const createButton = screen.getByText(/Create New User/i);
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText('Enter username'), {
        target: { value: 'newuser' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter email'), {
        target: { value: 'newuser@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter password'), {
        target: { value: 'password123' }
      });
    });

    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123'
        })
      );
    });
  });

  test('displays role badges correctly', async () => {
    api.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    
    renderWithRouter();
    
    await waitFor(() => {
      const badges = screen.getAllByText(/admin|contributor/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  test('displays user profile information when available', async () => {
    api.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Test Hospital')).toBeInTheDocument();
    });
  });
});
