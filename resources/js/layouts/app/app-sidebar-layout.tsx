import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useEffect } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    useEffect(() => {
        console.log("AppSidebarLayout mounted")
    }, []);
    console.log("AppSidebarLayout rendering...")


    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="h-dvh !m-0  ">
                {/*<AppSidebarHeader breadcrumbs={breadcrumbs} />*/}
                {children}
            </AppContent>
        </AppShell>
    );
}
