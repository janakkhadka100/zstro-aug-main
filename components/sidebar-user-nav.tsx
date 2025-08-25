'use client';
import { ChevronUp } from 'lucide-react';
import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import UserModal from '@/components/UserModal';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useEffect } from 'react';

export function SidebarUserNav({ user }: { user: User }) {
  const { setTheme, theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullUser, setFullUser] = useState<Partial<Record<string, any>>>({});
  const [astroSummary, setAstroSummary] = useState(null);

  useEffect(() => {
    async function fetchUserAndAstroSummary() {
      if (!isModalOpen || !user.id) return;

      try {
        const [userRes, astroRes] = await Promise.all([
          fetch(`/api/user/${user.id}`),
          fetch(`/api/astro-summary?userId=${user.id}`),
        ]);

        const userData = await userRes.json();
        const astroData = await astroRes.json();

        setFullUser(userData);
        setAstroSummary(astroData);
      } catch (err) {
        console.error('❌ Error fetching user or astro summary:', err);
      }
    }

    fetchUserAndAstroSummary();
  }, [isModalOpen, user.id]);

  
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
                <Image
                  src={`https://avatar.vercel.sh/${user.email}`}
                  alt={user.email ?? 'User Avatar'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="truncate">{user?.email}</span>
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setIsModalOpen(true)}
              >
                Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full cursor-pointer"
                  onClick={() => {
                    signOut({ redirectTo: '/' });
                  }}
                >
                  Sign out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      
      <UserModal user={fullUser} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} astroSummary={astroSummary}/>
    </>
  );
}
