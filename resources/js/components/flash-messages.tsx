import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';

interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export default function FlashMessages() {
    const { props } = usePage<PageProps>();

    useEffect(() => {
        const { success, error } = props.flash || {};
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [props.flash]);

    return null;
} 