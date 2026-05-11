import type { PropsWithChildren } from 'react';

export default function StaffPortalLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-svh flex-col bg-[#f4f1ee] transition-colors dark:bg-[#171313]">
            {/* Header */}
            <header className="border-b-2 border-[#efbf00] bg-[#60060d] px-6 py-2">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0">
                        <img
                            src="/usep-logo-small.png"
                            alt="USEP Logo"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="font-serif text-xs leading-tight font-bold text-white">
                            University of Southeastern Philippines
                        </p>
                        <p className="text-[10px] leading-tight text-white">
                            Obrero Campus, Davao City
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center px-4 py-8">
                {children}
            </div>
        </div>
    );
}
