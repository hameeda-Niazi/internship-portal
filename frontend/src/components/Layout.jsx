import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = [
    ['Find internships', '/internships'],
    ...(user?.role === 'user' ? [['My applications', '/applications'], ['Saved', '/saved']] : []),
    ...(user?.role === 'employer' ? [['Employer studio', '/employer']] : []),
    ...(user?.role === 'admin' ? [['Admin panel', '/admin']] : []),
    ['About', '/about']
  ];
  function signOut() { logout(); setOpen(false); navigate('/'); }
  return <>
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" to="/"><span className="brand-mark">l</span> launchpad<span className="brand-dot">.</span></Link>
        <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <FiX /> : <FiMenu />}</button>
        <nav className={open ? 'main-nav open' : 'main-nav'}>
          {links.map(([label, href]) => <NavLink key={href} to={href} onClick={() => setOpen(false)}>{label}</NavLink>)}
          {user ? <><NavLink to="/profile" onClick={() => setOpen(false)} className="nav-profile">{user.name.split(' ')[0]}</NavLink><button className="nav-login" onClick={signOut}>Log out</button></>
            : <><NavLink className="nav-login" to="/login">Log in</NavLink><Link className="button button-dark nav-cta" to="/register">Get started <FiArrowUpRight /></Link></>}
        </nav>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="footer">
      <div className="footer-top"><Link className="brand" to="/"><span className="brand-mark">l</span> launchpad<span className="brand-dot">.</span></Link><p>A more thoughtful first step into your career.</p><div className="footer-links"><Link to="/internships">Explore roles</Link><Link to="/about">Our story</Link><Link to="/contact">Contact</Link></div></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Launchpad. Built for what’s next.</span><span>Made for early careers ✳</span></div>
    </footer>
  </>;
}
