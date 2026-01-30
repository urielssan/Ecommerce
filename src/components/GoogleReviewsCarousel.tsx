import React, { useState, useEffect, useCallback } from 'react';
import styles from './styles/GoogleReviewsCarousel.module.css';
import { FaStar } from 'react-icons/fa';

// Mock data fallback in case API is not configured yet
const MOCK_REVIEWS = [
    {
        id: 1,
        author: "María Fernández",
        initial: "M",
        stars: 5,
        text: "¡La mejor carnicería de la zona! La calidad de la carne es excelente y la atención es inmejorable.",
        date: "hace 2 días"
    },
    {
        id: 2,
        author: "Carlos Gómez",
        initial: "C",
        stars: 5,
        text: "Hice mi primer pedido online y fue todo perfecto. Las milanesas son caseras de verdad, muy ricas.",
        date: "hace 1 semana"
    }
];

const GoogleReviewsCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch from backend
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reviews`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setReviews(data);
                } else {
                    // Fallback if no reviews (or no API key set)
                    setReviews(MOCK_REVIEWS);
                }
            })
            .catch(err => {
                console.error("Error fetching reviews", err);
                setReviews(MOCK_REVIEWS);
            })
            .finally(() => setLoading(false));
    }, []);

    const nextReview = useCallback(() => {
        if (reviews.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, [reviews.length]);

    // Auto-play
    useEffect(() => {
        if (reviews.length === 0) return;
        const interval = setInterval(() => {
            nextReview();
        }, 6000);

        return () => clearInterval(interval);
    }, [reviews, nextReview]);

    const prevReview = () => {
        if (reviews.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    if (loading || reviews.length === 0) {
        return <div style={{ height: '200px' }}></div>; // Spacer while loading
    }

    const currentReview = reviews[currentIndex];

    return (
        <div className={styles['reviews-carousel-container']}>
            <button className={`${styles['review-nav-btn']} ${styles['prev-btn']}`} onClick={prevReview} aria-label="Review anterior">‹</button>
            <button className={`${styles['review-nav-btn']} ${styles['next-btn']}`} onClick={nextReview} aria-label="Review siguiente">›</button>

            <div className={styles['review-slide']}>
                <div className={styles['review-header']}>
                    <div className={styles['reviewer-avatar']}>
                        {currentReview.initial}
                    </div>
                    <div className={styles['reviewer-info']}>
                        <span className={styles['reviewer-name']}>{currentReview.author}</span>
                        <div className={styles['review-meta']}>
                            <div className={styles['stars-row']}>
                                {[...Array(currentReview.stars)].map((_, i) => (
                                    <FaStar key={i} size={12} />
                                ))}
                            </div>
                            <span>{currentReview.date}</span>
                        </div>
                    </div>
                    {/* Optional: Small Google G icon if available, or just keeping clean */}
                    {/* <img src={googleLogo} alt="G" className="google-icon-sm" /> */}
                </div>

                <p className={styles['review-text']}>"{currentReview.text}"</p>

                {/* Footer simple showing source */}
                <div style={{ fontSize: '14px', color: '#575757ff', textAlign: 'right' }}>
                    Publicado en Google
                </div>
            </div>

            <div className={styles['review-dots']}>
                {reviews.map((_, idx) => (
                    <div
                        key={idx}
                        className={`${styles.dot} ${idx === currentIndex ? styles.active : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    />
                ))}
            </div>
        </div>
    );
};

export default GoogleReviewsCarousel;
