import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { InstallSection } from './components/InstallSection';
import { PricingSection } from './components/PricingSection';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Settings } from './pages/Settings';
import { Checkout, CheckoutSuccess } from './pages/Checkout';
function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans selection:bg-[#5CE0D8]/30 selection:text-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <InstallSection />
        <PricingSection />
      </main>
    </div>);

}
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/checkout/:plan" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
      </Routes>
    </BrowserRouter>);

}