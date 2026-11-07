// src/app/layout.js
import './globals.css';


export const metadata = {
  title: 'Don Framework Frontend',
  description: 'Full-stack testing with Rust backend',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}