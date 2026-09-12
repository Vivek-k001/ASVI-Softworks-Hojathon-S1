import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { FloatingAssistant } from '../components/assistant/FloatingAssistant';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-sand">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingAssistant />
    </div>
  );
};
