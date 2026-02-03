"use client";

import React from 'react';
import styles from './EditorialSection.module.scss';
import StoryCard from './StoryCard';
import { stories } from '../../constants/stories';
import Button from '../ui/Button';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';

const EditorialSection = () => {
    const sectionRef = useEntranceAnimation<HTMLElement>({ threshold: 0.2 });

    return (
        <section className={styles.section} ref={sectionRef}>

            <div className={`container ${styles.contentOverlay}`}>
                <div className={styles.header}>
                    <p>EWC Chronicles</p>
                    <h2>Latest Stories</h2>
                    <div style={{ width: '40px', height: '1px', background: '#c6a664', margin: '20px auto' }}></div>
                </div>

                <div className={styles.grid}>
                    {stories.map((story) => (
                        <StoryCard key={story.id} data={story} />
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <Button variant="outline" isDarkOutline={true} href="/stories">View All Stories</Button>
                </div>
            </div>
        </section>
    );
};

export default EditorialSection;
