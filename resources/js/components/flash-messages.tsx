import { useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { toast } from 'react-toastify';

interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
    [key: string]: unknown;
}

export default function FlashMessages() {
    const { props } = usePage<PageProps>();

    useEffect(() => {
        const { success, error } = props.flash || {};
        const { errors } = props;

        if (success) {
            toast.success(success);
            router.remember({ ...props, flash: { ...props.flash, success: undefined } });
        }
        if (error) {
            toast.error(error);
            router.remember({ ...props, flash: { ...props.flash, error: undefined } });
        }
        if (errors && Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            toast.error(firstError);
            router.remember({ ...props, errors: undefined });
        }
    }, [props]);

    return null;
} 