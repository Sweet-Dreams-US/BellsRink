import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

type Submission = {
  id: string;
  form: 'contact' | 'newsletter';
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  extra: Record<string, unknown> | null;
  created_at: string;
};

type Filter = 'all' | 'contact' | 'newsletter';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'contact', label: 'Contact form' },
  { value: 'newsletter', label: 'Newsletter signups' },
];

const PAGE_SIZE = 50;

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Form answers arrive as text; a plain date (the birthday field) reads better spelled out. */
function formatAnswer(value: unknown): string {
  const answer = String(value);
  const date = answer.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!date) return answer;
  return new Date(Number(date[1]), Number(date[2]) - 1, Number(date[3])).toLocaleDateString('en-US', {
    dateStyle: 'long',
  });
}

const Submissions: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [rows, setRows] = useState<Submission[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const latest = useRef(0);

  const load = useCallback(async () => {
    const ticket = ++latest.current;
    setLoading(true);
    setFailed(false);

    let query = supabase.from('form_submissions').select('*', { count: 'exact' });
    if (filter !== 'all') query = query.eq('form', filter);
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(0, limit - 1);

    if (ticket !== latest.current) return; // a newer request has since been made
    setLoading(false);
    if (error || !data) {
      setFailed(true);
      return;
    }
    setRows(data as Submission[]);
    setTotal(count ?? data.length);
  }, [filter, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const choose = (next: Filter) => {
    setFilter(next);
    setLimit(PAGE_SIZE);
  };

  return (
    <div>
      <div className="admin-heading">
        <div>
          <h2>Messages</h2>
          <p className="admin-muted">Everything sent through the website's forms, newest first.</p>
        </div>
        <button type="button" className="admin-btn" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <div className="admin-filters" role="group" aria-label="Show">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className="admin-chip"
            aria-pressed={filter === value}
            onClick={() => choose(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {failed && (
        <p className="admin-alert" role="alert">
          Couldn't load the messages. Check your internet connection, then press Refresh. If it keeps
          happening, log out and back in.
        </p>
      )}

      {rows && rows.length === 0 && !failed && (
        <div className="admin-empty">
          <p>No messages here yet.</p>
          <p className="admin-muted">When someone fills out a form on the website, it shows up on this page.</p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <>
          <p className="admin-count">
            Showing {rows.length} of {total}
          </p>
          <ul className="admin-list">
            {rows.map((row) => (
              <li className="admin-card" key={row.id}>
                <div className="admin-card-top">
                  <div>
                    <h3>{row.name || (row.form === 'newsletter' ? 'Newsletter signup' : 'No name given')}</h3>
                    <time dateTime={row.created_at}>{formatWhen(row.created_at)}</time>
                  </div>
                  <span className={`admin-badge is-${row.form}`}>
                    {row.form === 'contact' ? 'Contact form' : 'Newsletter'}
                  </span>
                </div>

                {row.subject && <p className="admin-subject">{row.subject}</p>}
                {row.message && <p className="admin-message">{row.message}</p>}

                <dl className="admin-fields">
                  {row.email && (
                    <div>
                      <dt>Email</dt>
                      <dd><a href={`mailto:${row.email}`}>{row.email}</a></dd>
                    </div>
                  )}
                  {row.phone && (
                    <div>
                      <dt>Phone</dt>
                      <dd><a href={`tel:${row.phone.replace(/[^\d+]/g, '')}`}>{row.phone}</a></dd>
                    </div>
                  )}
                  {Object.entries(row.extra ?? {}).map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{formatAnswer(value)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>

          {rows.length < total && (
            <button
              type="button"
              className="admin-btn admin-more"
              onClick={() => setLimit((current) => current + PAGE_SIZE)}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Show older messages'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Submissions;
