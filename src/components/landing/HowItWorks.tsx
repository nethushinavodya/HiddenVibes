const steps = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    num: '01',
    title: 'Discover',
    description: 'Browse community-shared hidden places across all 25 districts of Sri Lanka.',
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    num: '02',
    title: 'Share',
    description: 'Submit your own secret spots with photos, descriptions, and location details.',
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    num: '03',
    title: 'Get Approved',
    description: 'Our team reviews every submission to maintain quality and authenticity.',
  },
]

export default function HowItWorks() {
  return (
    <section className="hv-hiw">
      <div className="hv-hiw-wrap">
        {/* Header */}
        <div className="hv-hiw-header">
          <p className="hv-hiw-label">How It Works</p>
          <h2 className="hv-hiw-title">
            Share the <em className="hv-hiw-em">Unseen</em>
          </h2>
        </div>

        {/* Cards */}
        <div className="hv-hiw-grid">
          {steps.map((step) => (
            <div key={step.title} className="hv-hiw-card">
              {/* Ghost number */}
              <span className="hv-hiw-num">{step.num}</span>
              {/* Icon circle */}
              <div className="hv-hiw-icon">{step.icon}</div>
              <h3 className="hv-hiw-card-title">{step.title}</h3>
              <p className="hv-hiw-card-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
