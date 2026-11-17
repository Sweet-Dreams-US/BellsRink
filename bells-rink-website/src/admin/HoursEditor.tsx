import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  DAYS,
  Day,
  Hours,
  Session,
  fetchHours,
  formatRange,
  isTime,
  normalizeHours,
  publishHours,
} from '../lib/hours';

const newId = () => `s-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** The first thing that would stop these hours from being saved, in plain words. */
function findProblem(hours: Hours): string {
  for (const session of hours.sessions) {
    const name = session.name.trim();
    if (!name) return `One of the ${session.day} sessions needs a name.`;
    if (!isTime(session.start) || !isTime(session.end)) {
      return `"${name}" on ${session.day} needs a start time and an end time.`;
    }
    if (session.end <= session.start) {
      return `"${name}" on ${session.day} ends before it starts. Check the AM and PM.`;
    }
  }
  return '';
}

type SaveState = 'idle' | 'saving' | 'saved' | 'failed';

const HoursEditor: React.FC = () => {
  const [draft, setDraft] = useState<Hours | null>(null);
  const [saved, setSaved] = useState<Hours | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [problem, setProblem] = useState('');
  const [justAdded, setJustAdded] = useState('');

  const load = useCallback(async () => {
    setLoadFailed(false);
    const stored = await fetchHours();
    if (!stored) {
      setLoadFailed(true);
      return;
    }
    setDraft(stored);
    setSaved(stored);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved);

  // Warn before closing the page with changes that have not been saved.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (loadFailed) {
    return (
      <div>
        <div className="admin-heading">
          <h2>Hours</h2>
        </div>
        <p className="admin-alert" role="alert">
          Couldn't load the hours. Check your internet connection and try again.
        </p>
        <button type="button" className="admin-btn" onClick={load}>Try again</button>
      </div>
    );
  }
  if (!draft) {
    return <p className="admin-muted">Loading the hours…</p>;
  }

  const change = (next: Hours) => {
    setDraft(next);
    setSaveState('idle');
    setProblem('');
  };

  const updateSession = (id: string, patch: Partial<Session>) =>
    change({ ...draft, sessions: draft.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const addSession = () => {
    const id = newId();
    setJustAdded(id);
    change({
      ...draft,
      sessions: [...draft.sessions, { id, day: 'Friday', name: '', start: '18:00', end: '20:00', price: '', details: '' }],
    });
  };

  const updateSpecial = (index: number, value: string) =>
    change({ ...draft, specials: draft.specials.map((s, i) => (i === index ? value : s)) });

  const save = async () => {
    const found = findProblem(draft);
    if (found) {
      setProblem(found);
      return;
    }
    const clean = normalizeHours(draft);
    if (!clean) return;

    setSaveState('saving');
    const { data, error } = await supabase
      .from('site_settings')
      .update({ value: clean, updated_at: new Date().toISOString() })
      .eq('key', 'hours')
      .select('key');

    // No row back means the database refused the change (usually an expired login).
    if (error || !data || data.length === 0) {
      setSaveState('failed');
      return;
    }
    publishHours(clean);
    setDraft(clean);
    setSaved(clean);
    setSaveState('saved');
  };

  return (
    <div className="admin-hours">
      <div className="admin-heading">
        <div>
          <h2>Hours</h2>
          <p className="admin-muted">
            Change anything below, then press Save. The website updates right away.
          </p>
        </div>
      </div>

      <div className="admin-card">
        <label htmlFor="hours-season">Note above the hours</label>
        <p className="admin-hint">Optional. For example, which dates this schedule covers.</p>
        <input
          id="hours-season"
          type="text"
          value={draft.season}
          maxLength={120}
          onChange={(e) => change({ ...draft, season: e.target.value })}
        />
      </div>

      <h3 className="admin-subheading">Weekly sessions</h3>
      <ul className="admin-list">
        {draft.sessions.map((session) => (
          <li className="admin-card admin-session" key={session.id}>
            <div className="admin-card-top">
              <p className="admin-session-summary">
                {session.day}
                {isTime(session.start) && isTime(session.end) && ` · ${formatRange(session.start, session.end)}`}
              </p>
              <button
                type="button"
                className="admin-btn danger"
                onClick={() => change({ ...draft, sessions: draft.sessions.filter((s) => s.id !== session.id) })}
                aria-label={`Remove ${session.name || 'this session'} on ${session.day}`}
              >
                Remove
              </button>
            </div>

            <div className="admin-grid three">
              <div>
                <label htmlFor={`day-${session.id}`}>Day</label>
                <select
                  id={`day-${session.id}`}
                  value={session.day}
                  onChange={(e) => updateSession(session.id, { day: e.target.value as Day })}
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`start-${session.id}`}>Starts</label>
                <input
                  id={`start-${session.id}`}
                  type="time"
                  value={session.start}
                  onChange={(e) => updateSession(session.id, { start: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor={`end-${session.id}`}>Ends</label>
                <input
                  id={`end-${session.id}`}
                  type="time"
                  value={session.end}
                  onChange={(e) => updateSession(session.id, { end: e.target.value })}
                />
              </div>
            </div>

            <label htmlFor={`name-${session.id}`}>Session name</label>
            <input
              id={`name-${session.id}`}
              type="text"
              value={session.name}
              maxLength={80}
              placeholder="Family Skate Night"
              autoFocus={session.id === justAdded}
              onChange={(e) => updateSession(session.id, { name: e.target.value })}
            />

            <div className="admin-grid two">
              <div>
                <label htmlFor={`price-${session.id}`}>Price</label>
                <input
                  id={`price-${session.id}`}
                  type="text"
                  value={session.price}
                  maxLength={60}
                  placeholder="$10 admission"
                  onChange={(e) => updateSession(session.id, { price: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor={`details-${session.id}`}>More details</label>
                <input
                  id={`details-${session.id}`}
                  type="text"
                  value={session.details}
                  maxLength={200}
                  placeholder="$2 skate rental"
                  onChange={(e) => updateSession(session.id, { details: e.target.value })}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {draft.sessions.length === 0 && (
        <p className="admin-muted">No sessions. The website will ask visitors to call for hours.</p>
      )}
      <button type="button" className="admin-btn" onClick={addSession}>+ Add a session</button>

      <h3 className="admin-subheading">Specials</h3>
      <p className="admin-hint">
        One line each, for things that don't happen every week. They show under the weekly sessions.
      </p>
      <ul className="admin-list">
        {draft.specials.map((special, index) => (
          <li className="admin-special" key={index}>
            <input
              type="text"
              value={special}
              maxLength={200}
              aria-label={`Special ${index + 1}`}
              onChange={(e) => updateSpecial(index, e.target.value)}
            />
            <button
              type="button"
              className="admin-btn danger"
              onClick={() => change({ ...draft, specials: draft.specials.filter((_, i) => i !== index) })}
              aria-label={`Remove special ${index + 1}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="admin-btn" onClick={() => change({ ...draft, specials: [...draft.specials, ''] })}>
        + Add a special
      </button>

      <div className="admin-savebar">
        <div className="admin-savebar-inner">
          <div className="admin-savebar-status" role="status">
            {problem && <span className="bad">{problem}</span>}
            {!problem && saveState === 'failed' && (
              <span className="bad">Couldn't save. Log out, log back in, and try again.</span>
            )}
            {!problem && saveState === 'saved' && <span className="good">Saved. The website now shows these hours.</span>}
            {!problem && saveState !== 'failed' && saveState !== 'saved' && dirty && <span>You have unsaved changes.</span>}
          </div>
          <div className="admin-savebar-actions">
            <button
              type="button"
              className="admin-btn"
              disabled={!dirty || saveState === 'saving'}
              onClick={() => saved && change(saved)}
            >
              Undo changes
            </button>
            <button
              type="button"
              className="admin-btn primary"
              disabled={!dirty || saveState === 'saving'}
              onClick={save}
            >
              {saveState === 'saving' ? 'Saving…' : 'Save hours'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoursEditor;
