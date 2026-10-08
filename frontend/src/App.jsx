import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Details from './pages/Details';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import Saved from './pages/Saved';
import Employer from './pages/Employer';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="internships" element={<Browse />} />
    <Route path="internships/:id" element={<Details />} />
    <Route path="login" element={<AuthPage />} />
    <Route path="register" element={<AuthPage register />} />
    <Route path="about" element={<About />} />
    <Route path="contact" element={<Contact />} />
    <Route element={<ProtectedRoute />}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="profile" element={<Profile />} />
    </Route>
    <Route element={<ProtectedRoute roles={['user']} />}>
      <Route path="applications" element={<Applications />} />
      <Route path="saved" element={<Saved />} />
    </Route>
    <Route element={<ProtectedRoute roles={['employer', 'admin']} />}>
      <Route path="employer" element={<Employer />} />
    </Route>
    <Route element={<ProtectedRoute roles={['admin']} />}>
      <Route path="admin" element={<Admin />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Route></Routes>;
}
