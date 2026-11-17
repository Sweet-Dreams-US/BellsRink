import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Submissions from './Submissions';
import HoursEditor from './HoursEditor';
import './Admin.css';

// The rink has one admin login. Its email is fixed here, so the owner only types the passcode.
const ADMIN_EMAIL = 'admin@bellsrink.com';

// The Supabase project is shared with other sites; a Bells admin carries the "bells" tag.
function isBellsAdmin(session: Session | null): boolean {
  const tenants = session?.user?.app_metadata?.tenants;
  return Array.isArray(tenants) && tenants.includes('bells');
}

const WRONG_PASSCODE = "That passcode didn't work. Check it and try again.";

const Login: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const entered = passcode.trim();
    if (!entered || busy) return;

    setBusy(true);
    setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: entered,
    });
    setBusy(false);

    if (signInError) {
      if (signInError.status === 429) {
        setError('Too many tries. Wait a minute, then try again.');
      } else if (signInError.status === 400) {
        setError(WRONG_PASSCODE);
      } else {
        setError("Couldn't reach the server. Check your internet connection and try again.");
      }
      return;
    }
    if (!isBellsAdmin(data.session)) {
      await supabase.auth.signOut();
      setError(WRONG_PASSCODE);
    }
  };

  return (
    <div className="admin admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <img src="/images/roofuspartyhat.png" alt="" className="admin-login-mascot" />
        <h1>Bell's Rink Admin</h1>
        <p className="admin-muted">Enter the passcode to see messages and update hours.</p>

        {/* Lets a password manager file the passcode under the right account. */}
        <input type="text" name="username" autoComplete="username" value={ADMIN_EMAIL} readOnly hidden />

        <label htmlFor="admin-passcode">Passcode</label>
        <input
          id="admin-passcode"
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          autoFocus
          required
        />
        <label className="admin-check">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          Show passcode
        </label>

        {error && <p className="admin-alert" role="alert">{error}</p>}

        <button type="submit" className="admin-btn primary" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
        <a className="admin-back" href="/">← Back to the website</a>
      </form>
    </div>
  );
};

type Tab = 'messages' | 'hours';

const Admin: React.FC = () => {
  // undefined while we check whether this browser is already logged in
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('messages');

  useEffect(() => {
    document.title = "Bell's Rink Admin";
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return <div className="admin admin-login" aria-busy="true" />;
  }
  if (!isBellsAdmin(session)) {
    return <Login />;
  }

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-bar-inner">
          <span className="admin-brand">Bell's Rink <span>Admin</span></span>
          <div className="admin-bar-actions">
            <a href="/" target="_blank" rel="noopener noreferrer">View website</a>
            <button type="button" className="admin-btn quiet" onClick={() => supabase.auth.signOut()}>
              Log out
            </button>
          </div>
        </div>
        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          <button
            type="button"
            role="tab"
            id="admin-tab-messages"
            aria-selected={tab === 'messages'}
            aria-controls="admin-panel-messages"
            onClick={() => setTab('messages')}
          >
            Messages
          </button>
          <button
            type="button"
            role="tab"
            id="admin-tab-hours"
            aria-selected={tab === 'hours'}
            aria-controls="admin-panel-hours"
            onClick={() => setTab('hours')}
          >
            Hours
          </button>
        </div>
      </header>

      {/* Both stay mounted so switching tabs never throws away unsaved hours. */}
      <main className="admin-main">
        <section id="admin-panel-messages" role="tabpanel" aria-labelledby="admin-tab-messages" hidden={tab !== 'messages'}>
          <Submissions />
        </section>
        <section id="admin-panel-hours" role="tabpanel" aria-labelledby="admin-tab-hours" hidden={tab !== 'hours'}>
          <HoursEditor />
        </section>
      </main>
    </div>
  );
};

export default Admin;
