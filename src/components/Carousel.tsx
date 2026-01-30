import React, { useState, useEffect } from 'react';
import styles from './styles/Carousel.module.css';

interface CarouselProps {
  images: string[];
  autoPlayInterval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ images, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [images.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={styles['carousel-container']}>
      <div className={styles['carousel-wrapper']}>
        <button
          className={`${styles['carousel-button']} ${styles['carousel-button-left']}`}
          onClick={goToPrevious}
          aria-label="Imagen anterior"
        >
          ‹
        </button>

        <div className={styles['carousel-slide']}>
          <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className={styles['carousel-image']}
          />
        </div>

        <button
          className={`${styles['carousel-button']} ${styles['carousel-button-right']}`}
          onClick={goToNext}
          aria-label="Siguiente imagen"
        >
          ›
        </button>
      </div>

      <div className={styles['carousel-dots']}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles['carousel-dot']} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir a la imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
