// app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  // No <html> or <body> here (or minimal usage)
  return <>{children}</>; 
}
