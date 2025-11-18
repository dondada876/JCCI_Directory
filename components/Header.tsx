"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-jamaica-black text-white shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-jamaica-gold">Jamaica</span>
              <span className="text-jamaica-green"> Connect</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-jamaica-gold transition-colors">
              Home
            </Link>
            <Link href="/directory" className="hover:text-jamaica-gold transition-colors">
              Directory
            </Link>
            <Link href="/news" className="hover:text-jamaica-gold transition-colors">
              News
            </Link>
            <Link href="/about" className="hover:text-jamaica-gold transition-colors">
              About Jamaica
            </Link>
            <Link href="/contact" className="hover:text-jamaica-gold transition-colors">
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              href="/"
              className="block hover:text-jamaica-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/directory"
              className="block hover:text-jamaica-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Directory
            </Link>
            <Link
              href="/news"
              className="block hover:text-jamaica-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              News
            </Link>
            <Link
              href="/about"
              className="block hover:text-jamaica-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About Jamaica
            </Link>
            <Link
              href="/contact"
              className="block hover:text-jamaica-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
