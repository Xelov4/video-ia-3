/**
 * Admin Sidebar Component
 * Navigation sidebar for admin interface using shadcn/ui components
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Home,
  Wrench,
  Folder,
  FileText,
  Settings,
  Users,
  Monitor,
  LogOut,
  ChevronUp,
  BeakerIcon,
  Bot,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/src/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Badge } from '@/src/components/ui/badge';

interface AdminSidebarProps {
  currentLang: string;
}

export const AdminSidebar = ({ currentLang }: AdminSidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const contentNavigation = [
    { name: 'Outils IA', href: '/admin/tools', icon: Wrench },
    { name: 'Catégories', href: '/admin/categories', icon: Folder },
    { name: 'Articles', href: '/admin/articles', icon: FileText },
  ];

  const adminNavigation = [
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Scraper Legacy', href: '/admin/scraper', icon: Monitor },
    { name: 'Atelier Scraper', href: '/admin/scraper-details', icon: BeakerIcon },
    { name: 'Image HTTP', href: '/admin/image-http', icon: Monitor },
    { name: 'Robots.txt', href: '/admin/robots', icon: Bot },
  ];

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/admin'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  <Monitor className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Video-IA.net</span>
                  <Badge variant='outline' className='text-xs'>
                    Admin
                  </Badge>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/admin'}
                  tooltip='Tableau de bord'
                >
                  <Link href='/admin'>
                    <Home className='size-4' />
                    <span>Tableau de bord</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Contenu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentNavigation.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href}>
                        <item.icon className='size-4' />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavigation.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href}>
                        <item.icon className='size-4' />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarFallback className='rounded-lg'>
                      {session.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {session.user?.name || 'Utilisateur'}
                    </span>
                    <span className='truncate text-xs'>
                      {session.user?.email || session.user?.role || 'Admin'}
                    </span>
                  </div>
                  <ChevronUp className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href='/admin/settings'>
                    <Settings className='mr-2 size-4' />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className='mr-2 size-4' />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
