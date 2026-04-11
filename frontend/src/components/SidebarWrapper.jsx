import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function SidebarWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  // Map standard URLs to the old page keys so Sidebar highlights correctly.
  let currentPage = 'dashboard';
  if (location.state?.source === 'explore') currentPage = 'explore';
  else if (location.pathname.startsWith('/explore')) currentPage = 'explore';
  else if (location.pathname.startsWith('/bookmarks')) currentPage = 'bookmarks';
  else if (location.pathname.startsWith('/subjects')) currentPage = 'subject-notes';
  else if (location.state?.source === 'profile') currentPage = 'explore'; // Keep Explore active for profiles too
  
  // Create a navigate wrapper that behaves exactly like the old custom router
  // so Sidebar component doesn't need to change much, just adapt its paths.
  const handleNavigate = (page) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'subject-notes') navigate('/subjects');
    else if (page === 'explore') navigate('/explore');
    else if (page === 'bookmarks') navigate('/bookmarks');
  };

  return (
    <div className="app-shell">
      <Sidebar navigate={handleNavigate} currentPage={currentPage} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
