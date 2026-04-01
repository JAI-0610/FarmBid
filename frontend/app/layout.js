import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'FarmBid - Blockchain Agricultural Auctions',
  description: 'Farmers set the price. Buyers compete upward. Blockchain guarantees it all.',
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
