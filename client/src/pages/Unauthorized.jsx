import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-rv-text">Access Denied</h1>
        <p className="mt-2 text-rv-muted">You do not have permission to view this page.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-rv-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-rv-accent/90">
          Go home
        </Link>
      </div>
    </div>
  );
}
