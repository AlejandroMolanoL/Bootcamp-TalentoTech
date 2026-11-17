'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import AlertBanner from './AlertBanner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isManagementPage = pathname.startsWith('/management');

  if (isAuthPage || isLandingPage || isDashboardPage || isManagementPage) {
    return (
      <>
        <AlertBanner />
        {children}
      </>
    );
  }

  return (
    <>
      <Navbar />
      <AlertBanner />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            TaskPulse &copy; {new Date().getFullYear()} - Laboratorio TalentoTech: Next.js + Nest.js + PostgreSQL + Redis + Docker
          </p>
        </div>
      </footer>
    </>
  );
}
