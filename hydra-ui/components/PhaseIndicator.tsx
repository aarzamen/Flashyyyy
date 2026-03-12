import React from 'react';
import { Phase } from '../types';

interface Props {
    phase: Phase;
}

const PHASES: { key: Phase; label: string }[] = [
    { key: 'diverging', label: 'Diverge' },
    { key: 'choosing', label: 'Choose' },
    { key: 'deepening', label: 'Deepen' },
];

export default function PhaseIndicator({ phase }: Props) {
    if (phase === 'idle') return null;

    const currentIndex = PHASES.findIndex(p => p.key === phase);

    return (
        <div className="phase-indicator">
            {PHASES.map((p, i) => (
                <React.Fragment key={p.key}>
                    {i > 0 && <span className="phase-connector" />}
                    <span className={[
                        'phase-step',
                        i === currentIndex && 'active',
                        i < currentIndex && 'completed',
                    ].filter(Boolean).join(' ')}>
                        {p.label}
                    </span>
                </React.Fragment>
            ))}
        </div>
    );
}
