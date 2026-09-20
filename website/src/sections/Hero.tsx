/*
 * Dario Casertano <dario@casertano.name>
 * Copyright (c) 2026 Casertano Dario – All rights reserved.
 * MIT
 */

import { CoffeeButton } from '../components/CoffeeButton';
import { GITHUB_URL } from '../lib/links';
import { RouteDiagram } from './RouteDiagram';

export function Hero() {
    return (
        <section className="hero section--flush" id="top">
            <div className="container hero__inner">
                <div className="hero__head">
                    <p className="eyebrow">Node.js / DNS / Performance</p>

                    <h1 className="hero__title">
                        Resolve once. <span className="accent">Move faster.</span>
                    </h1>
                </div>

                <div className="hero__body">
                    <div className="hero__copy">
                        <p className="hero__sub">
                            A zero-dependency DNS resolver with intelligent caching, provider
                            control
                            and request deduplication for Node.js.
                        </p>

                        <div className="btn-row">
                            <a className="btn btn--primary" href="#install">
                                Install package <span className="btn__arrow">→</span>
                            </a>
                            <a
                                className="btn"
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                View on GitHub <span className="btn__arrow">↗</span>
                            </a>
                        </div>

                        <p className="hero__meta">
                            <span className="mono">ZERO DEPENDENCIES</span>
                            <span className="mono">NODE 20+</span>
                            <span className="mono">TYPESCRIPT</span>
                        </p>

                        <div className="hero__support">
                            <CoffeeButton/>
                        </div>
                    </div>

                    <div className="hero__visual">
                        <RouteDiagram/>
                    </div>
                </div>
            </div>
        </section>
    );
}
