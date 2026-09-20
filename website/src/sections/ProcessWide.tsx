/*
 * Dario Casertano <dario@casertano.name>
 * Copyright (c) 2026 Casertano Dario – All rights reserved.
 * MIT
 */

import { CodeBlock } from '../components/CodeBlock';

const CONSUMERS = [
    'fetch',
    'axios',
    'node:http',
    'third-party deps',
] as const;

export function ProcessWide() {
    return (
        <section className="section" id="process">
            <div className="container">
                <div className="section-head">
                    <p className="eyebrow">Process-wide</p>
                    <h2 className="section-title">
                        Configure DNS once.
                        <br/>
                        Let the process use it.
                    </h2>
                    <p className="section-lead">
                        <code className="mono">setProvider()</code>, <code
                        className="mono">setServers()</code>{' '}
                        and Node's result ordering are process-global. Every HTTP client in the
                        process —
                        yours and your dependencies' — inherits the same resolution strategy.
                    </p>
                </div>

                <div className="process__grid">
                    <div className="process__visual">
                        <div className="proc">
                            <div className="proc__consumers">
                                {CONSUMERS.map((consumer) => (
                                    <span key={consumer} className="proc__consumer mono">
										{consumer}
									</span>
                                ))}
                            </div>
                            <span className="proc__bus" aria-hidden="true"/>
                            <div className="proc__core">
                                <span className="mono">SmartDns</span>
                                <span className="proc__core-note mono">process-global DNS</span>
                            </div>
                            <span className="proc__bus" aria-hidden="true"/>
                            <div className="proc__resolver mono">resolver / servers</div>
                        </div>
                    </div>

                    <div className="process__side">
                        <aside className="aside-note aside-note--loud">
                            <span className="aside-note__label mono">DELIBERATE SIDE EFFECT</span>
                            <p>
                                SmartDns intentionally affects Node's process-global DNS
                                configuration.
                                Initialize it early and avoid conflicting configurations.
                            </p>
                        </aside>
                        <CodeBlock id="providers" caption="provider selection"/>
                    </div>
                </div>
            </div>
        </section>
    );
}
