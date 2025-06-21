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
        const urlParams = new URLSearchParams(window.location.search);
        const editSuccess = urlParams.get('edit_success');
        
        if (editSuccess === 'true') {
            const pathParts = window.location.pathname.split('/');
            const entityName = pathParts[1];
            
            const entityTranslations: Record<string, string> = {
                'companies': 'Compañía',
                'users': 'Usuario',
                'departments': 'Departamento',
                'positions': 'Cargo',
                'attendance-methods': 'Método de marcado',
                'attendance-records': 'Registro de asistencia',
                'holidays': 'Feriado',
                'shifts': 'Turno',
                'qr-codes': 'Código QR'
            };
            
            const entityNameTranslated = entityTranslations[entityName] || 'Registro';
            toast.success(`${entityNameTranslated} actualizado exitosamente.`);
            
            urlParams.delete('edit_success');
            const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, []);

    useEffect(() => {
        const { success, error } = props.flash || {};
        const { errors } = props;

        const urlParams = new URLSearchParams(window.location.search);
        const editSuccess = urlParams.get('edit_success');
        
        if (success && editSuccess !== 'true') {
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