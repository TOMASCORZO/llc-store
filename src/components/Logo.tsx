import React from 'react';

interface LogoProps {
    size?: number;
    color?: string;
    showText?: boolean;
}

export default function Logo({ size = 20, color, showText = true }: LogoProps) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="QuickLLC">
                <rect x="2" y="2" width="20" height="20" rx="5" fill={color || 'var(--ink)'} />
                <path d="M7 12 l4 4 l6 -8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showText && (
                <span style={{
                    fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em',
                    color: color || 'var(--ink)',
                }}>
                    QuickLLC
                </span>
            )}
        </span>
    );
}
