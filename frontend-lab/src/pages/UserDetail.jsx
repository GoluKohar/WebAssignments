
import { useParams, Link } from 'react-router-dom';

const users = [
  { id: 1, name: 'Ram Suwan Pasi', email: 'ram@example.com' },
  { id: 2, name: 'Rohit Kohar', email: 'rohit@example.com' },
  { id: 3, name: 'Krishna Tiwari', email: 'krishna@example.com' },
];

export default function UserDetail() {
  const { id } = useParams();

  const user = users.find((u) => u.id === Number(id));

  if (!user) {
    return <h2>User not found</h2>;
  }

  return (
    <div>
      <h1>User Details</h1>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <Link to="/users">Back to Users</Link>
    </div>
  );
}
