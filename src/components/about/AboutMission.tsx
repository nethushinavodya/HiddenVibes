'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const slides = [
  '/images/about2.jpg',
  '/images/about3.jpg',
  '/images/about4.jpg',
  '/images/about5.jpg',
]

const AboutMission = () => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hv-about-mission">
      <div className="hv-about-mission-inner">
        <div className="hv-about-mission-text">
          <h2 className="hv-about-mission-title">Why We Built HiddenVibes</h2>
          <div className="hv-about-mission-body">
            <p>
              Sri Lanka is an island of extraordinary beauty — from misty mountain trails and
              ancient ruins to secluded beaches and sacred forests. Yet most travellers only scratch
              the surface, following the same well-worn paths.
            </p>
            <p>
              We created HiddenVibes to change that. Our platform connects curious explorers with
              locals and seasoned travellers who know the island&apos;s hidden corners. Every
              submission is reviewed to ensure quality and authenticity.
            </p>
            <p>
              Whether it&apos;s a waterfall tucked deep in a tea estate, a forgotten temple in the
              jungle, or a beach only the fishermen know — if it&apos;s worth discovering,
              you&apos;ll find it here.
            </p>
          </div>
        </div>

        <div className="hv-about-mission-visual">
          <div className="hv-about-mission-slider">
            {slides.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt="HiddenVibes mission"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                priority={i === 0}
                className={`hv-about-slider-item${active === i ? ' hv-about-slider-item--active' : ''}`}
              />
            ))}

            {/* Dots */}
            <div className="hv-about-slider-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`hv-about-slider-dot${active === i ? ' hv-about-slider-dot--active' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <span className="hv-about-mission-deco hv-about-mission-deco--br" />
          <span className="hv-about-mission-deco hv-about-mission-deco--tl" />
        </div>
      </div>
    </section>
  )
}

export default AboutMission
