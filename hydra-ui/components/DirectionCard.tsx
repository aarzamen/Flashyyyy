import React, { useRef, useEffect } from 'react';
import { Direction } from '../types';
import { SpinnerIcon } from './Icons';

interface DirectionCardProps {
    direction: Direction;
    isSelected: boolean;
    isFocused: boolean;
    onClick: () => void;
    onDoubleClick: () => void;
}

const DirectionCard = React.memo(({
    direction,
    isSelected,
    isFocused,
    onClick,
    onDoubleClick,
}: DirectionCardProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current && direction.html) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(direction.html);
                doc.close();
            }
        }
    }, [direction.html]);

    const isLoading = direction.status === 'pending' || direction.status === 'naming';
    const isStreaming = direction.status === 'streaming';

    return (
        <div
            className={[
                'direction-card',
                isSelected && 'selected',
                isFocused && 'focused',
                isLoading && 'loading',
                isStreaming && 'streaming',
            ].filter(Boolean).join(' ')}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            <div className="card-chrome">
                <div className="card-badge">{direction.letter}</div>
                <div className="card-meta">
                    <span className="card-name">
                        {isLoading ? 'Conceiving...' : direction.name}
                    </span>
                    {direction.philosophy && (
                        <span className="card-philosophy">{direction.philosophy}</span>
                    )}
                </div>
                {(isLoading || isStreaming) && (
                    <div className="card-status">
                        <SpinnerIcon />
                    </div>
                )}
            </div>
            <div className="card-viewport">
                {direction.html ? (
                    <iframe
                        ref={iframeRef}
                        title={`Direction ${direction.letter}: ${direction.name}`}
                        sandbox="allow-scripts"
                        loading="lazy"
                    />
                ) : (
                    <div className="card-empty">
                        <div className="pulse-ring" />
                        <span>{isLoading ? 'Imagining direction...' : 'Waiting...'}</span>
                    </div>
                )}
            </div>
        </div>
    );
});

export default DirectionCard;
