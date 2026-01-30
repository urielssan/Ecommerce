import React from 'react';
import styles from './styles/PrimaryButton.module.css';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className, ...props }) => {
    return (
        <button className={`${styles['btn-primary']} ${className || ''}`} {...props}>
            {children}
        </button>
    );
};

export default PrimaryButton;
