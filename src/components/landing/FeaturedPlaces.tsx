import Link from 'next/link'

const places = [
  {
    title: 'Diyaluma Secret Pool',
    district: 'Badulla',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    description:
      "A hidden natural infinity pool at the top of Sri Lanka's second highest waterfall.",
  },
  {
    title: 'Kahandamodara Beach',
    district: 'Matara',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    description: 'An untouched golden beach with no tourists, surrounded by coconut palms.',
  },
  {
    title: 'Ritigala Forest Monastery',
    district: 'Anuradhapura',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    description: 'Ancient monastery ruins hidden deep within a mysterious cloud forest.',
  },
]

export default function FeaturedPlaces() {
  return (
    <section className="hv-featured">
      <div className="hv-featured-wrap">
        {/* Header */}
        <div className="hv-featured-header">
          <div>
            <p className="hv-featured-label">Featured Discoveries</p>
            <h2 className="hv-featured-title">
              Hidden Gems of
              <br />
              <em className="hv-featured-title-em">Sri Lanka</em>
            </h2>
          </div>
          <Link href="/explore" className="hv-featured-viewall">
            View all places
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </div>

        {/* Cards grid */}
        <div className="hv-featured-grid">
          {places.map((place) => (
            <article key={place.title} className="hv-place-card">
              <div className="hv-place-card-img-wrap">
                <img
                  src={place.image}
                  alt={place.title}
                  className="hv-place-card-img"
                  loading="lazy"
                />
              </div>
              <div className="hv-place-card-overlay" />
              <div className="hv-place-card-content">
                <div className="hv-place-card-district">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {place.district}
                </div>
                <h3 className="hv-place-card-title">{place.title}</h3>
                <p className="hv-place-card-desc">{place.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
