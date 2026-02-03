"use client";

import React from 'react';
import styles from './Hero.module.scss';
import Button from '../ui/Button';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';

const Hero = () => {
    // Shared hook handles standard entrance animation
    const contentRef = useEntranceAnimation({ delay: 0.5, duration: 1.5 });

    return (
        <section className={styles.hero}>
            <div className={styles.background}>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.videoBackground}
                >
                    <source src="/videos/hero-background.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className={styles.content} ref={contentRef}>
                <span className={styles.subtitle}>Savoir-Faire</span>
                <h1 className={styles.title}>The Mastery of Time</h1>
                <div className={styles.ctaContainer}>
                    <Button variant="outline" href="/collections" isDarkOutline={false}>
                        Discover Collection
                    </Button>
                </div>
            </div>

        </section>
    );
};

export default Hero;
