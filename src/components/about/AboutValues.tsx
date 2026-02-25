import { MapPin, Users, Shield, Heart } from 'lucide-react'

const values = [
  {
    Icon: MapPin,
    title: 'Authentic Discovery',
    desc: 'Every place on HiddenVibes is a real, community-verified hidden gem — no tourist traps, no paid promotions.',
  },
  {
    Icon: Users,
    title: 'Community First',
    desc: 'Our platform is powered by passionate explorers who share their personal discoveries with fellow travellers.',
  },
  {
    Icon: Shield,
    title: 'Responsible Tourism',
    desc: 'We encourage visitors to respect nature, local communities, and leave every place better than they found it.',
  },
  {
    Icon: Heart,
    title: 'Preserving Beauty',
    desc: "By sharing responsibly, we help protect Sri Lanka's hidden treasures for future generations to enjoy.",
  },
]

const AboutValues = () => {
  return (
    <section className="hv-about-values">
      <div className="hv-section-wrap">
        <div className="hv-about-values-header">
          <h2 className="hv-about-values-title">What We Stand For</h2>
          <p className="hv-about-values-sub">
            Our core values guide everything we do at HiddenVibes.
          </p>
        </div>
        <div className="hv-about-values-grid">
          {values.map(({ Icon, title, desc }) => (
            <div key={title} className="hv-about-value-card">
              <div className="hv-about-value-icon">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className="hv-about-value-title">{title}</h3>
              <p className="hv-about-value-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutValues
