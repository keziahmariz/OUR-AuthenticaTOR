import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            can: {
                manageWelcomeContent: boolean;
                manageSignatures: boolean;
                manageAcademicPrograms: boolean;
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
