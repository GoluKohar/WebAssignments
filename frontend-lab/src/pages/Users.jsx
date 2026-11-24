
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useEffect, useState } from 'react';

const users = [
  { id: 1, name: 'Ram Suwan Pasi', email: 'ram@example.com' },
  { id: 2, name: 'Rohit Kohar', email: 'rohit@example.com' },
  { id: 3, name: 'Krishna Tiwari', email: 'krishna@example.com' },
];

export default function Users() {
  const [search, setSearch] = useLocalStorage('userSearch', '');
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1>Users List</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p>Viewport Width: {width}px</p>

      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <div key={user.id}>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <Link to={`/users/${user.id}`}>
              View Details
            </Link>
          </div>
        ))
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}
