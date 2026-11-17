import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Parties from './pages/Parties';
import Gallery from './pages/Gallery';
import Policies from './pages/Policies';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import Footer from './components/Footer';
import ConversionTracker from './components/ConversionTracker';
import { Analytics } from '@vercel/analytics/react';
import './App.css';

// The owner's admin page: loaded only when someone opens /admin.
const Admin = React.lazy(() => import('./admin/Admin'));

function Site() {
  const { pathname } = useLocation();

  // /admin stands alone: no site navigation, footer or visitor analytics.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <ConversionTracker />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/parties" element={<Parties />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Site />
    </Router>
  );
}

export default App;
