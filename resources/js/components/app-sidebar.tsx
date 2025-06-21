import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Folder, LayoutGrid, Users, Building, Building2, UserPlus, ScanFace, Calendar, CalendarCheck, Clock, QrCode, ScanLine } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Código QR',
        href: '/qr-codes',
        icon: QrCode,
    },
    {
        title: 'Registros de Asistencia',
        href: '/attendance-records',
        icon: CalendarCheck,
    },
    {
        title: 'Métodos de Marcado',
        href: '/attendance-methods',
        icon: ScanFace,
    },
    {
        title: 'Feriados',
        href: '/holidays',
        icon: Calendar,
    },
    {
        title: 'Usuarios',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Turnos',
        href: '/shifts',
        icon: Clock,
    },
    {
        title: 'Compañias',
        href: '/companies',
        icon: Building,
    },
    {
        title: 'Departamentos',
        href: '/departments',
        icon: Building2,
    },
    {
        title: 'Cargos',
        href: '/positions',
        icon: UserPlus,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Registre su asistencia',
        href: '/scann-attendance',
        icon: ScanLine,
    },
    {
        title: 'Repositorio',
        href: 'https://github.com/MarvinH10/asistencias-app',
        icon: Folder,
    },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
