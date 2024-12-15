import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Form, Field } from 'react-final-form';
import { GET_USERS, CREATE_USER, UPDATE_USER, DELETE_USER } from './graphql';

const App = () => {
  const { data, loading, refetch } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  const [editingUser, setEditingUser] = useState(null);

  // Load the first user by default when data is available
  useEffect(() => {
    if (data && data.users.length > 0) {
      setEditingUser(data.users[0]);
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;

  const onSubmit = async (values, form) => {
    if (values.id) {
      // Update user
      await updateUser({ variables: values });
    } else {
      // Create user
      await createUser({ variables: { name: values.name, email: values.email } });
    }
    refetch();
    // setEditingUser(null); // Clear editing state
    // form.restart(); // Reset the form
  };

  const handleEdit = (user) => {
    setEditingUser(user); // Set the user to edit
  };

  const handleDelete = async (id) => {
    await deleteUser({ variables: { id } });
    refetch();

    // If the deleted user was being edited, reset to the first user
    if (editingUser && editingUser.id === id) {
      setEditingUser(data.users[0] || null);
    }
  };

  return (
    <div>
      <h1>User Management</h1>

      {/* Render the Form */}
      <Form
        onSubmit={onSubmit}
        initialValues={editingUser || {}} // Load initial values if editing
        render={({ handleSubmit, form, pristine, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Field name="id" component="input" type="hidden" />
            <div>
              <label>Name</label>
              <Field name="name" component="input" placeholder="Name" required />
            </div>
            <div>
              <label>Email</label>
              <Field name="email" component="input" type="email" placeholder="Email" required />
            </div>
            <button type="submit" disabled={pristine || submitting}>
              {submitting ? 'Submitting...' : editingUser ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                form.restart();
                setEditingUser(data.users[0]); // Reset to the first user
              }}
              disabled={submitting}
            >
              Reset
            </button>
          </form>
        )}
      />

      {/* Render the User List */}
      <ul>
        {data.users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleEdit(user)}>Edit</button>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
