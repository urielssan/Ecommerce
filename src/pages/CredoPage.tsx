import React, { useState, useEffect } from 'react';
import styles from './styles/CredoPage.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import credoFamily from '../assets/credo_family.png';
import credoNature from '../assets/credo_nature.png';
import credoWork from '../assets/credo_work.png';
import credoDignity from '../assets/credo_dignity.png';
import credoSatisfaction from '../assets/credo_satisfaction.png';
import credoOvercoming from '../assets/credo_overcoming.png';
import credoSustainability from '../assets/credo_sustainability.png';
import credoBalance from '../assets/credo_balance.png';
import credoAncestors from '../assets/credo_ancestors.png';
import credoDiversity from '../assets/credo_diversity.png';

const credoItems = [
    { id: 1, image: credoFamily, text: "Unión familiar como piedra angular." },
    { id: 2, image: credoNature, text: "Humildad del humus hecho hombres." },
    { id: 3, image: credoWork, text: "Resiliencia ante la adversidad." },
    { id: 4, image: credoDignity, text: "Dignificación a través del trabajo." },
    { id: 5, image: credoSatisfaction, text: "Satisfacción por la labor bien realizada." },
    { id: 6, image: credoOvercoming, text: "Superación permanente." },
    { id: 7, image: credoSustainability, text: "Generación de valor cuidando nuestra madre naturaleza." },
    { id: 8, image: credoBalance, text: "Equilibrio en cada uno de los aspectos de nuestra vida." },
    { id: 9, image: credoAncestors, text: "Honrar a nuestros antepasados." },
    { id: 10, image: credoDiversity, text: "Respeto a la diversidad religiosa, racial, política, social, cultural y sexual." }
];

const CredoPage: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const nextSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev === credoItems.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev === 0 ? credoItems.length - 1 : prev - 1));
    };

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    // Reset animation lock
    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 500); // Match CSS transition
        return () => clearTimeout(timer);
    }, [currentIndex]);

    return (
        <div className={styles['credo-container']}>
            <header className={styles['credo-header']}>
                <span className={styles['credo-pretitle']}>Nuestros Principios</span>
                <h1>Nuestro Credo</h1>
                <div className={styles['header-divider']}></div>
                <p className={styles['credo-intro']}>
                    Estos son los pilares que sostienen a la Familia García Vidal.
                </p>
            </header>

            <div className={styles['carousel-wrapper']}>
                <div className={styles['carousel-content']}>

                    <div className={styles['carousel-image-container']}>
                        <img
                            src={credoItems[currentIndex].image}
                            alt={`Principio ${credoItems[currentIndex].id}`}
                            className={styles['carousel-image']}
                        />
                        <div className={styles['image-overlay']}></div>
                    </div>

                    <div className={styles['carousel-text-container']}>
                        <div className={styles['slide-number']}>0{credoItems[currentIndex].id}</div>
                        <h2 className={styles['slide-text']}>
                            "{credoItems[currentIndex].text}"
                        </h2>
                    </div>

                    <button className={`${styles['nav-btn']} ${styles['prev-btn']}`} onClick={prevSlide}>
                        <FaChevronLeft />
                    </button>
                    <button className={`${styles['nav-btn']} ${styles['next-btn']}`} onClick={nextSlide}>
                        <FaChevronRight />
                    </button>
                </div>

                <div className={styles['indicators']}>
                    {credoItems.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles['indicator']} ${index === currentIndex ? styles['active'] : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Ir a principio ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className={styles['credo-footer']}>
                <p>— Familia García Vidal —</p>
            </div>
        </div>
    );
};

export default CredoPage;
