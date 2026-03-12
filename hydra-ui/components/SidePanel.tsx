import React from 'react';
import { Variation } from '../types';
import { SpinnerIcon } from './Icons';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    mode: 'code' | 'variations' | null;
    codeContent?: string;
    variations?: Variation[];
    isLoadingVariations?: boolean;
    onSelectVariation?: (html: string) => void;
}

const SidePanel = ({
    isOpen,
    onClose,
    title,
    mode,
    codeContent,
    variations = [],
    isLoadingVariations,
    onSelectVariation,
}: SidePanelProps) => {
    if (!isOpen) return null;

    return (
        <div className="panel-overlay" onClick={onClose}>
            <div className="panel-content" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="panel-close">&times;</button>
                </div>
                <div className="panel-body">
                    {mode === 'code' && codeContent && (
                        <pre className="code-block"><code>{codeContent}</code></pre>
                    )}

                    {mode === 'variations' && isLoadingVariations && (
                        <div className="panel-loading">
                            <SpinnerIcon />
                            <span>Generating variations...</span>
                        </div>
                    )}

                    {mode === 'variations' && variations.length > 0 && (
                        <div className="variations-grid">
                            {variations.map((v, i) => (
                                <div
                                    key={i}
                                    className="variation-card"
                                    onClick={() => onSelectVariation?.(v.html)}
                                >
                                    <div className="variation-preview">
                                        <iframe
                                            srcDoc={v.html}
                                            title={v.name}
                                            sandbox="allow-scripts"
                                        />
                                    </div>
                                    <div className="variation-label">{v.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SidePanel;
