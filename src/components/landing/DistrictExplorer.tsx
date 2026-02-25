import Link from 'next/link'

const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Mullaitivu',
  'Vavuniya',
  'Trincomalee',
  'Batticaloa',
  'Ampara',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
  'Anuradhapura',
  'Polonnaruwa',
  'Kurunegala',
  'Puttalam',
]

export default function DistrictExplorer() {
  return (
    <section className="hv-districts-sec">
      <div className="hv-districts-wrap">
        {/* Header */}
        <div className="hv-districts-header">
          <p className="hv-districts-label">Explore by District</p>
          <h2 className="hv-districts-title">
            All 25 <em className="hv-districts-em">Districts</em>
          </h2>
        </div>

        {/* Pills */}
        <div className="hv-districts-pills">
          {DISTRICTS.map((district) => (
            <Link
              key={district}
              href={`/explore?district=${encodeURIComponent(district)}`}
              className="hv-district-pill"
            >
              {district}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
