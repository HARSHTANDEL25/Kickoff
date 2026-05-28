import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'KickOff — Your Football Hub'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: 1200,
                    height: 630,
                    background: '#09090b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Glow */}
                <div style={{
                    position: 'absolute',
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: '#00F5D4',
                    opacity: 0.06,
                    filter: 'blur(120px)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }} />

                {/* Logo */}
                <div style={{
                    display: 'flex',
                    fontSize: 120,
                    fontWeight: 900,
                    letterSpacing: '-4px',
                    lineHeight: 1,
                    marginBottom: 24,
                }}>
                    <span style={{ color: '#ffffff' }}>Kick</span>
                    <span style={{ color: '#00F5D4' }}>Off</span>
                </div>

                {/* Tagline */}
                <div style={{
                    fontSize: 28,
                    color: '#9ca3af',
                    letterSpacing: '0px',
                    marginBottom: 48,
                }}>
                    Live scores · Transfers · News · Standings
                </div>

                {/* Pills */}
                <div style={{ display: 'flex', gap: 12 }}>
                    {['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].map(l => (
                        <div key={l} style={{
                            padding: '8px 16px',
                            borderRadius: 999,
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#6b7280',
                            fontSize: 16,
                            background: 'rgba(255,255,255,0.04)',
                        }}>
                            {l}
                        </div>
                    ))}
                </div>
            </div>
        ),
        { ...size }
    )
}
