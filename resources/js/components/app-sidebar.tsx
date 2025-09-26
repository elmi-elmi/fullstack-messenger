import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder } from 'lucide-react';
import AppLogo from './app-logo';
import { useEffect, useState } from 'react';
import { useEchoPresence } from '@laravel/echo-react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/layouts/app-layout';
import Home from '@/pages/home';


const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <div className={'flex justify-between items-center'}>
                        <h2 className={''}>Conversations</h2>
                        <SidebarMenuItem >
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/" prefetch >
                                    <PencilSquareIcon/>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </div>

                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

