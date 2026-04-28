import React, { useMemo } from 'react';
import './Events.css';

const Events: React.FC = () => {
  const allEvents = useMemo(() => [
    {
      date: 'Saturday, December 6th',
      dateValue: new Date('2025-12-06'),
      name: 'Kpop Demon Hunter Skate',
      time: '6:30 PM - 9:00 PM',
      icon: '🎵',
      color: 'music'
    },
    {
      date: 'Sunday, December 14th',
      dateValue: new Date('2025-12-14'),
      name: 'Toy Drive',
      time: 'During Regular Hours',
      icon: '🎁',
      color: 'special'
    },
    {
      date: 'Monday, December 15th',
      dateValue: new Date('2025-12-15'),
      name: 'Praise And Worship Skate',
      time: '6:00 PM - 8:00 PM',
      icon: '✝️',
      color: 'worship'
    },
    {
      date: 'Monday, December 22nd',
      dateValue: new Date('2025-12-22'),
      name: '2 For 1 School\'s Out Skate',
      time: '12:30 PM - 3:00 PM',
      icon: '🎓',
      color: 'deal'
    },
    {
      date: 'Friday, December 29th',
      dateValue: new Date('2025-12-29'),
      name: '2 For 1 School\'s Out Skate & 80\'s Night',
      time: '12:30 PM - 3:00 PM & 6:30 PM - 9:00 PM',
      icon: '🎸',
      color: 'retro'
    },
    {
      date: 'Monday, December 29th',
      dateValue: new Date('2025-12-29'),
      name: '2 For 1 School\'s Out Skate',
      time: '12:30 PM - 3:00 PM',
      icon: '🎓',
      color: 'deal'
    },
    {
      date: 'Wednesday, December 31st',
      dateValue: new Date('2025-12-31'),
      name: 'Noon Year\'s Eve Kids Bash',
      time: '12:00 PM - 3:00 PM',
      icon: '🎉',
      color: 'celebration'
    },
    {
      date: 'Monday, January 26th',
      dateValue: new Date('2026-01-26'),
      name: 'Praise And Worship Skate',
      time: '6:00 PM - 8:00 PM',
      icon: '✝️',
      color: 'worship'
    },
    {
      date: 'Friday, January 30th',
      dateValue: new Date('2026-01-30'),
      name: 'Afternoon Homeschool Skate',
      time: '12:00 PM - 2:00 PM',
      icon: '📚',
      color: 'special'
    },
    {
      date: 'Friday, February 13th',
      dateValue: new Date('2026-02-13'),
      name: 'Afternoon Homeschool Skate',
      time: '12:00 PM - 2:00 PM',
      icon: '📚',
      color: 'special'
    },
    {
      date: 'Saturday, February 14th',
      dateValue: new Date('2026-02-14'),
      name: 'Valentine\'s Day Late Skate',
      time: '6:30 PM - 11:00 PM',
      icon: '❤️',
      color: 'celebration'
    },
    {
      date: 'Monday, February 16th',
      dateValue: new Date('2026-02-16'),
      name: 'Schools Out Skate',
      time: '12:30 PM - 3:00 PM',
      icon: '🎓',
      color: 'deal'
    },
    {
      date: 'Wednesday, February 18th',
      dateValue: new Date('2026-02-18'),
      name: 'Dollar Skate',
      time: '6:00 PM - 8:00 PM',
      icon: '💰',
      color: 'deal'
    },
    {
      date: 'Wednesday, February 25th',
      dateValue: new Date('2026-02-25'),
      name: 'Dollar Skate',
      time: '6:00 PM - 8:00 PM',
      icon: '💰',
      color: 'deal'
    },
    {
      date: 'Friday, February 27th',
      dateValue: new Date('2026-02-27'),
      name: 'Afternoon Homeschool Skate',
      time: '12:00 PM - 2:00 PM',
      icon: '📚',
      color: 'special'
    },
    {
      date: 'Saturday, February 28th',
      dateValue: new Date('2026-02-28'),
      name: 'Late Night Glow Skate with DJ Krazy K',
      time: '6:30 PM - 9:00 PM',
      icon: '🎵',
      color: 'music'
    },
    {
      date: 'Wednesday, April 15th',
      dateValue: new Date('2026-04-15'),
      name: '$1 Night',
      time: '6:00 PM - 8:00 PM',
      description: '$1 admission',
      icon: '💰',
      color: 'deal'
    },
    {
      date: 'Friday, April 17th',
      dateValue: new Date('2026-04-17'),
      name: 'Family Pizza Night with DJ Krazy K',
      time: '6:30 PM - 9:00 PM',
      description: '$10/skater or Family Pack $40 (pizza & pitcher included)',
      icon: '🍕',
      color: 'celebration'
    },
    {
      date: 'Saturday, April 18th',
      dateValue: new Date('2026-04-18'),
      name: 'Roll & Glow with DJ Krazy K',
      time: '6:30 PM - 9:00 PM',
      description: '$10 per skater',
      icon: '✨',
      color: 'music'
    },
    {
      date: 'Sunday, April 19th',
      dateValue: new Date('2026-04-19'),
      name: 'Family Fun Skate',
      time: '12:30 PM - 3:00 PM',
      description: '$8/skater or $30 for family of 5',
      icon: '⛸️',
      color: 'special'
    },
    {
      date: 'Sunday, April 19th',
      dateValue: new Date('2026-04-19'),
      name: 'Adult Skate Night 18+ with DJ Krazy K',
      time: '8:00 PM - 11:00 PM',
      description: '$10 per skater',
      icon: '🌙',
      color: 'music'
    },
    {
      date: 'Wednesday, April 29th',
      dateValue: new Date('2026-04-29'),
      name: '$1 Night',
      time: '6:00 PM - 8:00 PM',
      description: '$1 admission',
      icon: '💰',
      color: 'deal'
    }
  ], []);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = allEvents.filter(event => event.dateValue >= today);
    const past = allEvents.filter(event => event.dateValue < today).reverse();

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [allEvents]);

  return (
    <div className="events">
      {/* Hero Section */}
      <section className="events-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="eyebrow-divider">Themed Nights · DJ Sets · Family Fun</div>
              <h1 className="poster-headline hero-poster">
                Special events <span className="script-accent gold">all year long.</span>
              </h1>
              <p className="hero-subtitle">From glow skates to pizza nights to holiday celebrations — there's always something on the calendar at Bell's. Bring the whole family.</p>
              <div className="hero-cta">
                <a href="tel:+12607498214" className="btn-arrow solid">
                  Call for Details <span className="arrow">→</span>
                </a>
                <a href="/parties" className="btn-arrow outline">
                  View Parties <span className="arrow">→</span>
                </a>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-characters">
                <div className="character-showcase">
                  <div className="character-speech">"Fun Events Ahead!"</div>
                  <img src="/images/roofuspartyhat.png" alt="Roofus party hat" className="hero-main-character" />
                </div>
                <div className="character-showcase">
                  <div className="character-speech">"Let's Celebrate!"</div>
                  <img src="/images/kookypartypopper.png" alt="Kooky party popper" className="hero-main-character" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Calendar Section */}
      <section className="events-calendar">
        <div className="events-background">
          <img src="/images/busynightkidsskating.webp" alt="Kids skating at night" className="background-image" />
        </div>
        <div className="container">
          <div className="section-eyebrow">
            <span className="eyebrow-tag">On the calendar</span>
          </div>
          <h2 className="poster-headline section-headline">
            What's coming up <span className="script-accent">next.</span>
          </h2>
          {upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map((event, index) => (
                <div key={index} className={`event-card ${event.color}`}>
                  <div className="event-icon">{event.icon}</div>
                  <div className="event-date">{event.date}</div>
                  <div className="event-name">{event.name}</div>
                  <div className="event-time">{event.time}</div>
                  {event.description && <div className="event-description">{event.description}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No upcoming events scheduled. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <section className="past-events-section">
          <div className="container">
            <div className="section-eyebrow">
              <span className="eyebrow-tag">The archives</span>
            </div>
            <h2 className="poster-headline section-headline">
              Past events, <span className="script-accent gold">remembered.</span>
            </h2>
            <div className="events-grid past-events-grid">
              {pastEvents.map((event, index) => (
                <div key={index} className={`event-card past-event ${event.color}`}>
                  <div className="past-badge">Past Event</div>
                  <div className="event-icon">{event.icon}</div>
                  <div className="event-date">{event.date}</div>
                  <div className="event-name">{event.name}</div>
                  <div className="event-time">{event.time}</div>
                  {event.description && <div className="event-description">{event.description}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Event Highlights Section */}
      <section className="event-highlights">
        <div className="container">
          <div className="section-eyebrow">
            <span className="eyebrow-tag">What to expect</span>
          </div>
          <h2 className="poster-headline section-headline">
            More than just <span className="script-accent">skating.</span>
          </h2>
          <div className="highlights-grid">
            <div className="highlight-card">
              <div className="highlight-icon">🎵</div>
              <h3>Themed Music Nights</h3>
              <p>Experience special music themes like Kpop, 80's Night, and Praise & Worship skating sessions!</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">🎁</div>
              <h3>Holiday Celebrations</h3>
              <p>Join us for festive events including our Toy Drive and Noon Year's Eve Kids Bash!</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">💰</div>
              <h3>2 For 1 Deals</h3>
              <p>Take advantage of our School's Out specials with 2 for 1 admission throughout the holidays!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Showcase Section */}
      <section className="photo-showcase">
        <div className="container">
          <div className="section-eyebrow">
            <span className="eyebrow-tag">In motion</span>
          </div>
          <h2 className="poster-headline section-headline">
            Experience the <span className="script-accent gold">excitement.</span>
          </h2>
          <div className="photo-gallery">
            <div className="photo-card large">
              <img src="/images/KpopNight/closeupneonadultsskates.webp" alt="Neon roller skates closeup" className="showcase-photo" />
              <div className="photo-overlay">
                <div className="photo-caption">Glow in the Dark Fun!</div>
              </div>
            </div>
            <div className="photo-card">
              <img src="/images/KpopNight/busynightkidsskating.webp" alt="Busy night kids skating" className="showcase-photo" />
              <div className="photo-overlay">
                <div className="photo-caption">Family Night Fun</div>
              </div>
            </div>
            <div className="photo-card">
              <img src="/images/KpopNight/closeupkidsskates.webp" alt="Kids skating closeup" className="showcase-photo" />
              <div className="photo-overlay">
                <div className="photo-caption">All Ages Welcome</div>
              </div>
            </div>
            <div className="photo-card">
              <img src="/images/KpopNight/Rollerskatecloseupwide.webp" alt="Roller skate closeup" className="showcase-photo" />
              <div className="photo-overlay">
                <div className="photo-caption">Classic Skating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Character Showcase */}
      <section className="character-section">
        <div className="container">
          <div className="character-display">
            <img src="/images/skaterfast.png" alt="Skater fast" className="event-character" />
            <div className="character-message">
              <h3>Don't Miss Out!</h3>
              <p>Follow us for updates on special events and last-minute announcements!</p>
              <a href="tel:+12607498214" className="character-cta">Call (260) 749-8214</a>
            </div>
            <img src="/images/roofuseatingpizza.png" alt="Roofus eating pizza" className="event-character" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="events-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="poster-headline section-headline">
              Got a question? <span className="script-accent gold">Just ask.</span>
            </h2>
            <p>Call us to learn more about our special events and themed nights.</p>
            <div className="cta-buttons">
              <a href="tel:+12607498214" className="btn-arrow solid">
                Call (260) 749-8214 <span className="arrow">→</span>
              </a>
              <a href="/parties" className="btn-arrow outline">
                Book a Party <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
