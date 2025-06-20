import React from 'react';

export interface ButtonProps {
    label: string;
    onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    className = '',
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false
}) => {
    const baseClasses = 'cursor-pointer font-medium flex items-center justify-center gap-1 rounded-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-neutral-400 hover:bg-neutral-500 text-white focus:ring-neutral-400',
        secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    };

    const sizeClasses = {
        sm: 'px-[20px] py-1.5 text-xs',
        md: 'px-[25px] py-2.5 text-sm',
        lg: 'px-[30px] py-3 text-base'
    };

    const disabledClasses = disabled
        ? 'opacity-50 cursor-not-allowed hover:bg-current'
        : '';

    const finalClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim();

    return (
        <button
            type={type}
            onClick={disabled ? undefined : onClick}
            className={finalClassName}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default Button;