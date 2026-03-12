export type DirectionLetter = 'A' | 'B' | 'C';

export type DirectionStatus = 'pending' | 'naming' | 'streaming' | 'complete' | 'error';

export interface Direction {
    id: string;
    letter: DirectionLetter;
    name: string;
    philosophy: string;
    html: string;
    status: DirectionStatus;
}

export type Phase = 'idle' | 'diverging' | 'choosing' | 'deepening';

export type DeepenPath = 'variations' | 'extract' | 'integrate' | 'remix';

export interface Session {
    id: string;
    prompt: string;
    timestamp: number;
    phase: Phase;
    directions: Direction[];
    selectedIndex: number | null;
}

export interface Variation {
    name: string;
    html: string;
}
