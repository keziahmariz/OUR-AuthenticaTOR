import { Link, usePage } from '@inertiajs/react';
import { GraduationCap, Signature, Upload } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { uploadTor } from '@/routes';
import { edit as editAcademicPrograms } from '@/routes/academic-programs';
import { edit as editSignatures } from '@/routes/signatures';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Upload Transcript of Records',
        href: uploadTor(),
        icon: Upload,
    },
];

export function AppSidebar() {
    const { can } = usePage().props;
    const adminNavItems: NavItem[] = [];

    if (can.manageSignatures) {
        adminNavItems.push({
            title: 'Signature References',
            href: editSignatures(),
            icon: Signature,
        });
    }

    if (can.manageAcademicPrograms) {
        adminNavItems.push({
            title: 'Academic Programs',
            href: editAcademicPrograms(),
            icon: GraduationCap,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={uploadTor()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {adminNavItems.length > 0 && (
                    <NavMain label="Management" items={adminNavItems} />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
