import { Metadata } from 'next';
import styles from './collections.module.scss';
import CollectionCard from '@/components/Collection/CollectionCard';
import { collections } from '@/constants/collections';

export const metadata: Metadata = {
    title: 'Our Collections | Enrique Clone',
    description: 'Explore our range of luxury mechanical watches.',
};

export default function CollectionsPage() {
    return (
        <main className={styles.page}>
            <div className="container">
                <div className={styles.intro}>
                    <h1>Our Collections</h1>
                    <p>
                        From the iconoclastic 007 to the avant-garde 009,
                        discover the distinct character of our families regarding specific complications.
                    </p>
                </div>

                <div className={styles.grid}>
                    {collections.map((collection) => (
                        <CollectionCard key={collection.id} data={collection} />
                    ))}
                </div>
            </div>
        </main>
    );
}
