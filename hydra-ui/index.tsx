import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { Direction, Session, Phase, Variation, DirectionLetter } from './types';
import { PLACEHOLDERS } from './constants';
import { generateId, cleanHtml } from './utils';
import { generateDirectionNames, streamDirectionHtml, generateVariations, DirectionMeta } from './api';

import HydraBackground from './components/HydraBackground';
import DirectionCard from './components/DirectionCard';
import SidePanel from './components/SidePanel';
import PhaseIndicator from './components/PhaseIndicator';
import {
    HydraIcon,
    ArrowUpIcon,
    SpinnerIcon,
    SparklesIcon,
    CodeIcon,
    GridIcon,
    ExpandIcon,
    PlugIcon,
    RemixIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from './components/Icons';

const LETTERS: DirectionLetter[] = ['A', 'B', 'C'];

function App() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSessionIndex, setCurrentSessionIndex] = useState(-1);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    const [panel, setPanel] = useState<{
        isOpen: boolean;
        mode: 'code' | 'variations' | null;
        title: string;
    }>({ isOpen: false, mode: null, title: '' });

    const [variations, setVariations] = useState<Variation[]>([]);
    const [loadingVariations, setLoadingVariations] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    // Cycle placeholders
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const currentSession = sessions[currentSessionIndex];
    const phase: Phase = currentSession?.phase ?? 'idle';
    const hasStarted = sessions.length > 0;

    // ── GENERATE 3 DIRECTIONS ──────────────────────────────────

    const handleGenerate = useCallback(async (manualPrompt?: string) => {
        const prompt = (manualPrompt || inputValue).trim();
        if (!prompt || isLoading) return;
        if (!manualPrompt) setInputValue('');

        setIsLoading(true);
        const sessionId = generateId();

        const placeholderDirections: Direction[] = LETTERS.map((letter, i) => ({
            id: `${sessionId}_${i}`,
            letter,
            name: '',
            philosophy: '',
            html: '',
            status: 'pending',
        }));

        const newSession: Session = {
            id: sessionId,
            prompt,
            timestamp: Date.now(),
            phase: 'diverging',
            directions: placeholderDirections,
            selectedIndex: null,
        };

        setSessions(prev => [...prev, newSession]);
        setCurrentSessionIndex(sessions.length);
        setFocusedIndex(null);

        const updateDirection = (dirId: string, updates: Partial<Direction>) => {
            setSessions(prev => prev.map(s =>
                s.id !== sessionId ? s : {
                    ...s,
                    directions: s.directions.map(d =>
                        d.id !== dirId ? d : { ...d, ...updates }
                    )
                }
            ));
        };

        const updatePhase = (p: Phase) => {
            setSessions(prev => prev.map(s =>
                s.id !== sessionId ? s : { ...s, phase: p }
            ));
        };

        try {
            // Step 1: Get 3 direction names + philosophies
            for (const d of placeholderDirections) {
                updateDirection(d.id, { status: 'naming' });
            }

            let metas: DirectionMeta[];
            try {
                metas = await generateDirectionNames(prompt);
            } catch (e) {
                console.error('Failed to generate direction names:', e);
                metas = [
                    { name: "Structural Grid", philosophy: "Mathematical precision", metaphor: "Blueprint" },
                    { name: "Fluid Organic", philosophy: "Living breathing surfaces", metaphor: "Organism" },
                    { name: "Bold Editorial", philosophy: "Magazine-grade hierarchy", metaphor: "Broadsheet" },
                ];
            }

            // Apply names
            for (let i = 0; i < 3; i++) {
                updateDirection(placeholderDirections[i].id, {
                    name: metas[i].name,
                    philosophy: metas[i].philosophy,
                    status: 'streaming',
                });
            }

            // Step 2: Stream all 3 HTML generations in parallel
            await Promise.all(placeholderDirections.map((dir, i) =>
                streamDirectionHtml(
                    prompt,
                    metas[i],
                    dir.letter,
                    (accumulated) => {
                        updateDirection(dir.id, { html: accumulated });
                    }
                ).then(finalHtml => {
                    updateDirection(dir.id, {
                        html: cleanHtml(finalHtml),
                        status: finalHtml ? 'complete' : 'error',
                    });
                }).catch(err => {
                    console.error(`Error streaming direction ${dir.letter}:`, err);
                    updateDirection(dir.id, {
                        html: `<div style="color:#ff6b6b;padding:40px;font-family:monospace">Error: ${err.message}</div>`,
                        status: 'error',
                    });
                })
            ));

            // Move to choosing phase
            updatePhase('choosing');

        } catch (e) {
            console.error('Fatal generation error:', e);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [inputValue, isLoading, sessions.length]);

    // ── SELECTION & DEEPENING ──────────────────────────────────

    const handleSelectDirection = useCallback((index: number) => {
        if (!currentSession || currentSession.phase === 'diverging') return;
        setFocusedIndex(index);
        setSessions(prev => prev.map((s, i) =>
            i !== currentSessionIndex ? s : { ...s, selectedIndex: index, phase: 'deepening' }
        ));
    }, [currentSession, currentSessionIndex]);

    const handleBackToGrid = () => {
        setFocusedIndex(null);
        setSessions(prev => prev.map((s, i) =>
            i !== currentSessionIndex ? s : { ...s, selectedIndex: null, phase: 'choosing' }
        ));
    };

    const handleShowCode = () => {
        if (currentSession && focusedIndex !== null) {
            setPanel({ isOpen: true, mode: 'code', title: 'Source Code' });
        }
    };

    const handleGenerateVariations = useCallback(async () => {
        if (!currentSession || focusedIndex === null) return;
        const dir = currentSession.directions[focusedIndex];
        setLoadingVariations(true);
        setVariations([]);
        setPanel({ isOpen: true, mode: 'variations', title: `Variations of "${dir.name}"` });

        try {
            const meta: DirectionMeta = {
                name: dir.name,
                philosophy: dir.philosophy,
                metaphor: dir.philosophy,
            };
            const gen = await generateVariations(
                currentSession.prompt,
                meta,
                dir.html,
            );
            for await (const v of gen) {
                setVariations(prev => [...prev, v]);
            }
        } catch (e) {
            console.error('Variation error:', e);
        } finally {
            setLoadingVariations(false);
        }
    }, [currentSession, focusedIndex]);

    const handleApplyVariation = (html: string) => {
        if (focusedIndex === null) return;
        setSessions(prev => prev.map((s, i) =>
            i !== currentSessionIndex ? s : {
                ...s,
                directions: s.directions.map((d, j) =>
                    j !== focusedIndex ? d : { ...d, html, status: 'complete' }
                )
            }
        ));
        setPanel(p => ({ ...p, isOpen: false }));
    };

    // ── INPUT HANDLERS ─────────────────────────────────────────

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            handleGenerate();
        } else if (e.key === 'Tab' && !inputValue && !isLoading) {
            e.preventDefault();
            setInputValue(PLACEHOLDERS[placeholderIdx]);
        }
    };

    const handleSurprise = () => {
        const p = PLACEHOLDERS[placeholderIdx];
        setInputValue(p);
        handleGenerate(p);
    };

    // ── NAVIGATION ─────────────────────────────────────────────

    const canGoBack = focusedIndex !== null
        ? focusedIndex > 0
        : currentSessionIndex > 0;

    const canGoForward = focusedIndex !== null
        ? focusedIndex < (currentSession?.directions.length || 0) - 1
        : currentSessionIndex < sessions.length - 1;

    const goBack = () => {
        if (focusedIndex !== null && focusedIndex > 0) setFocusedIndex(focusedIndex - 1);
        else if (currentSessionIndex > 0) setCurrentSessionIndex(currentSessionIndex - 1);
    };

    const goForward = () => {
        if (focusedIndex !== null && focusedIndex < 2) setFocusedIndex(focusedIndex + 1);
        else if (currentSessionIndex < sessions.length - 1) setCurrentSessionIndex(currentSessionIndex + 1);
    };

    // ── RENDER ─────────────────────────────────────────────────

    const selectedDirection = currentSession && focusedIndex !== null
        ? currentSession.directions[focusedIndex]
        : null;

    return (
        <>
            <SidePanel
                isOpen={panel.isOpen}
                onClose={() => setPanel(p => ({ ...p, isOpen: false }))}
                title={panel.title}
                mode={panel.mode}
                codeContent={selectedDirection?.html}
                variations={variations}
                isLoadingVariations={loadingVariations && variations.length === 0}
                onSelectVariation={handleApplyVariation}
            />

            <div className="hydra-app">
                <HydraBackground phase={phase} />

                <header className="hydra-header">
                    <div className="brand">
                        <HydraIcon />
                        <span className="brand-name">Hydra UI</span>
                    </div>
                    <PhaseIndicator phase={phase} />
                </header>

                {/* Empty state */}
                <div className={`hero ${hasStarted ? 'collapsed' : ''}`}>
                    <div className="hero-content">
                        <div className="hero-icon"><HydraIcon /></div>
                        <h1>Hydra UI</h1>
                        <p>Three heads. Three visions. One prompt.</p>
                        <button
                            className="surprise-btn"
                            onClick={handleSurprise}
                            disabled={isLoading}
                        >
                            <SparklesIcon /> Surprise Me
                        </button>
                    </div>
                </div>

                {/* Direction cards grid */}
                <div className={`stage ${focusedIndex !== null ? 'focus-mode' : 'grid-mode'}`}>
                    {sessions.map((session, sIdx) => {
                        if (sIdx !== currentSessionIndex) return null;
                        return (
                            <div key={session.id} className="directions-row">
                                {session.directions.map((dir, dIdx) => (
                                    <DirectionCard
                                        key={dir.id}
                                        direction={dir}
                                        isSelected={session.selectedIndex === dIdx}
                                        isFocused={focusedIndex === dIdx}
                                        onClick={() => handleSelectDirection(dIdx)}
                                        onDoubleClick={() => {
                                            setFocusedIndex(dIdx);
                                            setSessions(prev => prev.map((s, i) =>
                                                i !== currentSessionIndex ? s
                                                    : { ...s, selectedIndex: dIdx, phase: 'deepening' }
                                            ));
                                        }}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Navigation arrows */}
                {canGoBack && (
                    <button className="nav-arrow left" onClick={goBack}>
                        <ChevronLeftIcon />
                    </button>
                )}
                {canGoForward && (
                    <button className="nav-arrow right" onClick={goForward}>
                        <ChevronRightIcon />
                    </button>
                )}

                {/* Deepen action bar */}
                <div className={`deepen-bar ${focusedIndex !== null ? 'visible' : ''}`}>
                    <div className="deepen-prompt">
                        {currentSession?.prompt}
                        {selectedDirection && (
                            <span className="deepen-direction"> — {selectedDirection.name}</span>
                        )}
                    </div>
                    <div className="deepen-actions">
                        <button onClick={handleBackToGrid}>
                            <GridIcon /> Grid
                        </button>
                        <button onClick={handleGenerateVariations} disabled={isLoading}>
                            <SparklesIcon /> Variations
                        </button>
                        <button onClick={handleShowCode}>
                            <CodeIcon /> Source
                        </button>
                    </div>
                </div>

                {/* Input bar */}
                <div className="input-container">
                    <div className={`input-chrome ${isLoading ? 'generating' : ''}`}>
                        {!inputValue && !isLoading && (
                            <div className="input-placeholder" key={placeholderIdx}>
                                <span>{PLACEHOLDERS[placeholderIdx]}</span>
                                <kbd>Tab</kbd>
                            </div>
                        )}
                        {!isLoading ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                        ) : (
                            <div className="generating-label">
                                <span>{currentSession?.prompt}</span>
                                <SpinnerIcon />
                            </div>
                        )}
                        <button
                            className="send-btn"
                            onClick={() => handleGenerate()}
                            disabled={isLoading || !inputValue.trim()}
                        >
                            <ArrowUpIcon />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

const root = document.getElementById('root');
if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode><App /></React.StrictMode>
    );
}
