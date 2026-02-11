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
      time: '9:00 PM - 11:00 PM',
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
      name: 'Roll-N-Glow with DJ Crazy K!',
      time: '6:30 PM - 9:00 PM',
      icon: '🎵',
      color: 'music'
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
              <h1>Special Events</h1>
              <p className="hero-subtitle">Join us for exciting themed skate nights and special celebrations at Bell's Skating Rink!</p>
              <div className="hero-cta">
                <a href="tel:+12607498214" className="cta-primary">Call for Details</a>
                <a href="/parties" className="cta-secondary">View Parties</a>
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
          <h2>Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map((event, index) => (
                <div key={index} className={`event-card ${event.color}`}>
                  <div className="event-icon">{event.icon}</div>
                  <div className="event-date">{event.date}</div>
                  <div className="event-name">{event.name}</div>
                  <div className="event-time">{event.time}</div>
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
            <h2>Past Events - See What You Missed!</h2>
            <div className="events-grid past-events-grid">
              {pastEvents.map((event, index) => (
                <div key={index} className={`event-card past-event ${event.color}`}>
                  <div className="past-badge">Past Event</div>
                  <div className="event-icon">{event.icon}</div>
                  <div className="event-date">{event.date}</div>
                  <div className="event-name">{event.name}</div>
                  <div className="event-time">{event.time}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Event Highlights Section */}
      <section className="event-highlights">
        <div className="container">
          <h2>Event Highlights</h2>
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
          <h2>Experience the Excitement</h2>
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
            <h2>Want More Information?</h2>
            <p>Call us to learn more about our special events and themed nights!</p>
            <div className="cta-buttons">
              <a href="tel:+12607498214" className="btn-primary">
                📞 Call (260) 749-8214
              </a>
              <a href="/parties" className="btn-secondary">Book a Party</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
