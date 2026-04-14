import React, { useState } from 'react';
import './Gallery.css';

interface Photo {
  src: string;
  alt: string;
}

const photos: Photo[] = [
  { src: '/images/Valentines/groupofkids.webp', alt: 'Group of kids at the rink' },
  { src: '/images/Valentines/DJ.webp', alt: 'DJ spinning tracks at the rink' },
  { src: '/images/Valentines/dancer.webp', alt: 'Skater showing off dance moves' },
  { src: '/images/Valentines/NewSkates.webp', alt: 'Brand new roller skates' },
  { src: '/images/Valentines/Kidsskating.webp', alt: 'Kids skating together' },
  { src: '/images/Valentines/overlookingskatinggame.webp', alt: 'Overlooking a skating game' },
  { src: '/images/Valentines/referee.webp', alt: 'Referee on the rink' },
  { src: '/images/Valentines/duo.webp', alt: 'Duo skating together' },
  { src: '/images/Valentines/newskatesonfeet.webp', alt: 'New skates on the floor' },
  { src: '/images/Valentines/twogirlsskating.webp', alt: 'Two girls skating together' },
  { src: '/images/Valentines/dancer2.webp', alt: 'Dancer on the skating floor' },
  { src: '/images/Valentines/DJ2.webp', alt: 'DJ at the booth' },
  { src: '/images/Valentines/youngkidgreatskater.webp', alt: 'Young kid showing great skating skills' },
  { src: '/images/Valentines/skatesonshelf.webp', alt: 'Skates lined up on the shelf' },
  { src: '/images/Valentines/groupogkidsskating.webp', alt: 'Group of kids skating on the floor' },
  { src: '/images/Valentines/BWfastskater.webp', alt: 'Fast skater in black and white' },
  { src: '/images/Valentines/newskates2.webp', alt: 'New roller skates closeup' },
  { src: '/images/Valentines/kidsksating2.webp', alt: 'Kids having fun skating' },
  { src: '/images/Valentines/refereesidestepskating.webp', alt: 'Referee side-step skating' },
  { src: '/images/Valentines/skatesonfloorgroup.webp', alt: 'Group of skates on the floor' },
  { src: '/images/Valentines/newskates3.webp', alt: 'Colorful new skates' },
  { src: '/images/Valentines/referee2.webp', alt: 'Referee watching the action' },
  { src: '/images/Valentines/newksatesonfeet2.webp', alt: 'Skaters showing off new skates' },
  { src: '/images/Valentines/newskates4.webp', alt: 'Fresh pair of roller skates' },
  { src: '/images/Valentines/skatesonfloorgroup2.webp', alt: 'Skates gathered on the floor' },
  { src: '/images/Valentines/newskates5.webp', alt: 'Roller skates on display' },
];

const Gallery: React.FC = () => {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  const openLightbox = (photo: Photo) => {
    setLightboxPhoto(photo);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxPhoto(null);
    document.body.style.overflow = '';
  };

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="container">
          <h1>Photo Gallery</h1>
          <p className="gallery-hero-subtitle">Check out the fun at Bell's Skating Rink!</p>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="gallery-grid-section">
        <div className="container">
          <div className="gallery-masonry">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="gallery-item"
                onClick={() => openLightbox(photo)}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
            &times;
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxPhoto.src} alt={lightboxPhoto.alt} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
