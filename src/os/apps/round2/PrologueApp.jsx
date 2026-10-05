import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Compass, Shield, MapPin } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';

export function PrologueApp() {
  const { openApp, teamData } = useOS();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      location: "SECTOR 4 — EXPEDITION SITE",
      title: "THE MISSING MEMORY",
      image: "/assets/prologue/scene1_awakening.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "This is the natural narrative continuation after the OS investigation.",
        "The first round establishes what was left behind.",
        "The next stage should establish what happened."
      ],
      speaker: "EXPLORER",
      speech: "What... happened here? The memories aren't matching the surviving records.",
      metadata: [
        "LOCATION: SECTOR 4 — EXPEDITION SITE",
        "STATUS: MEMORY CORRUPTION DETECTED",
        "LOG SOURCE: OS INVESTIGATION RECOVERY"
      ]
    },
    {
      location: "RECOVERED LOGS",
      title: "CORRUPTED MEMORIES",
      image: "/assets/prologue/scene2_gear.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "The recovered information from Round 1 points toward the missing expedition.",
        "The Explorer begins reconstructing events from damaged logs and system fragments."
      ],
      speaker: "EXPLORER",
      speech: "Reconstructing records... Radio traces, system fragments, and the recurring symbol.",
      metadata: [
        "RECOVERED RECORDS: 7 DATA FRAGMENTS",
        "RADIO TRACES: INTERMITTENT",
        "CORRUPTION LEVEL: 84%"
      ]
    },
    {
      location: "DATA ARCHIVE",
      title: "THE CENTRAL MYSTERY",
      image: "/assets/prologue/scene3_light.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "A central contradiction emerges in the archives.",
        "Why does the Explorer remember things that appear nowhere in the surviving records?"
      ],
      speaker: "EXPLORER",
      speech: "Why do I remember this? It appears nowhere in the surviving files.",
      metadata: [
        "ARCHIVED EVIDENCE: INCONSISTENT",
        "RECURRING SYMBOL: ACTIVE",
        "ANOMALY DETECTED: MEMORY MISMATCH"
      ]
    },
    {
      location: "EVIDENCE ANALYSIS",
      title: "CONTRADICTIONS",
      image: "/assets/prologue/scene4_radio.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "The player starts discovering contradictions everywhere.",
        "Some files suggest one version of events. Other evidence suggests something completely different."
      ],
      speaker: "EXPLORER",
      speech: "Two different stories... Which version of events actually occurred?",
      metadata: [
        "FILE VERSION A: OFFICIAL EXPEDITION LOG",
        "FILE VERSION B: CLASSIFIED FRAGMENT",
        "STATUS: DIVERGENT HISTORIES"
      ]
    },
    {
      location: "THE ANOMALY",
      title: "THE SPIRE INCIDENT",
      image: "/assets/prologue/scene5_warning.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "The glowing structure is no longer just a distant landmark.",
        "It appears to be directly connected to the incident."
      ],
      speaker: "EXPLORER",
      speech: "The structure... It was at the center of the incident all along.",
      metadata: [
        "STRUCTURE DISTANCE: 0m",
        "FIELD ANOMALY: CRITICAL",
        "INCIDENT LINK: CONFIRMED"
      ]
    },
    {
      location: "EXPEDITION OBJECTIVE",
      title: "RECONSTRUCT THE EVENT",
      image: "/assets/prologue/scene6_decision.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "You will finish this round with more questions than answers.",
        "Possess enough information to understand that the original expedition was investigating something extraordinary."
      ],
      speaker: "SYSTEM",
      speech: "Objective active. Reconstruct the lost event through optical synthesis.",
      metadata: [
        "FINAL OBJECTIVE: RECONSTRUCT THE LOST EVENT",
        "TARGET: RESTORE FIELD DATA",
        "STATUS: READY FOR STAGE 2"
      ]
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: '#070b07',
      color: '#eae0c8',
      fontFamily: 'Montserrat, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1rem',
        background: 'rgba(22, 28, 20, 0.95)',
        borderBottom: '1px solid rgba(223, 177, 37, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={16} color="#dfb125" />
          <span style={{ fontFamily: 'Cinzel', fontSize: '0.88rem', fontWeight: 700, color: '#dfb125', letterSpacing: '1px' }}>
            MISSION BRIEFING & RECOVERED LOGS
          </span>
          <span style={{ fontSize: '0.72rem', color: '#a8a08d' }}>
            (CHAPTER {currentSlide + 1} OF {slides.length})
          </span>
        </div>

        <button
          type="button"
          onClick={() => openApp('round2')}
          style={{
            background: 'linear-gradient(135deg, #dfb125, #b89114)',
            color: '#060905',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '4px',
            fontFamily: 'Cinzel',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Compass size={13} />
          <span>Launch Stage 2</span>
        </button>
      </div>

      {/* Main Slide Card Area */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          background: 'rgba(14, 20, 14, 0.85)',
          border: '1px solid rgba(223, 177, 37, 0.3)',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Slide Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1.25rem',
            background: 'rgba(22, 28, 20, 0.95)',
            borderBottom: '1px solid rgba(223, 177, 37, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dfb125', fontSize: '0.72rem', letterSpacing: '1px' }}>
              <MapPin size={12} />
              <span>{slide.location}</span>
            </div>
            <h3 style={{ margin: 0, fontFamily: 'Cinzel', fontSize: '0.95rem', color: '#fff', letterSpacing: '1.5px' }}>
              {slide.title}
            </h3>
          </div>

          {/* Visual Scene Area */}
          <div style={{
            position: 'relative',
            height: '240px',
            background: '#040604',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img
              src={slide.image}
              alt={slide.title}
              onError={e => { e.currentTarget.src = slide.fallbackImage; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(14, 20, 14, 0.95) 0%, transparent 60%)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1.25rem',
              right: '1.25rem'
            }}>
              <div style={{
                background: 'rgba(7, 11, 7, 0.85)',
                border: '1px solid rgba(223, 177, 37, 0.35)',
                padding: '0.65rem 1rem',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#dfb125', letterSpacing: '1px' }}>
                  [{slide.speaker}]
                </span>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#eae0c8', fontStyle: 'italic' }}>
                  "{slide.speech}"
                </p>
              </div>
            </div>
          </div>

          {/* Transcript & Metadata */}
          <div style={{
            padding: '1rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '1.25rem',
            background: 'rgba(14, 20, 14, 0.95)'
          }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#a8a08d', letterSpacing: '1px' }}>
                EXPEDITION TRANSCRIPT
              </span>
              <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', color: '#d1c7b7', lineHeight: '1.4' }}>
                {slide.transcript.map((line, i) => (
                  <p key={i} style={{ margin: 0 }}>&bull; {line}</p>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.7rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
              color: '#889280'
            }}>
              <span style={{ color: '#dfb125', fontWeight: 700 }}>TELEMETRY METADATA</span>
              {slide.metadata.map((meta, i) => (
                <div key={i} style={{ fontFamily: 'Fira Code' }}>{meta}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Pagination & Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto'
        }}>
          <button
            type="button"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(c => Math.max(0, c - 1))}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(223, 177, 37, 0.2)',
              color: currentSlide === 0 ? '#555' : '#eae0c8',
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: idx === currentSlide ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentSlide ? '#dfb125' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentSlide < slides.length - 1) {
                setCurrentSlide(c => c + 1);
              } else {
                openApp('round2');
              }
            }}
            style={{
              background: currentSlide === slides.length - 1 ? 'linear-gradient(135deg, #dfb125, #b89114)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid ' + (currentSlide === slides.length - 1 ? '#dfb125' : 'rgba(223, 177, 37, 0.2)'),
              color: currentSlide === slides.length - 1 ? '#060905' : '#eae0c8',
              fontWeight: currentSlide === slides.length - 1 ? 700 : 500,
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span>{currentSlide === slides.length - 1 ? 'Enter Stage 2' : 'Next'}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
export default PrologueApp;
