import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";

interface Props {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  /** Hide desktop navbar too (e.g. auth page) */
  hideNavbar?: boolean;
  /** Hide footer on all viewports */
  hideFooter?: boolean;
  /** Transparent mobile header (e.g. hero pages) */
  transparentHeader?: boolean;
}

export default function MobileLayout({
  children,
  title,
  showBack,
  hideNavbar = false,
  hideFooter = false,
  transparentHeader = false,
}: Props) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: standard navbar */}
      {!hideNavbar && <div className="hidden md:block"><Navbar /></div>}

      {/* Mobile: app-style header */}
      {isMobile && (
        <MobileHeader title={title} showBack={showBack} transparent={transparentHeader} />
      )}

      {/* Main content with bottom padding on mobile for BottomNav */}
      <main className={isMobile ? "pb-20" : ""}>
        {children}
      </main>

      {/* Desktop: footer */}
      {!hideFooter && <div className="hidden md:block"><Footer /></div>}

      {/* Mobile: bottom navigation */}
      {isMobile && <BottomNav />}
    </div>
  );
}
