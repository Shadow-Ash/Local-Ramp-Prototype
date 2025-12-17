import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletBadge } from "@/components/wallet-badge";
import { useWallet } from "@/lib/contexts";
import { Menu, X, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LocalRamp } from "../../public/Local-Ramp.svg"

export function Header() {
  const { isConnected } = useWallet();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  const navigation = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Browse Offers", path: "/offers" },
    { name: "Profile", path: "/profile" },
    { name: "History", path: "/history" },
    { name: "Help", path: "/help" },
    { name: "Settings", path: "/settings" },
    { name: "Admin Panel", path: "/admin" },
  ];

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide header when scrolling down (after 10px threshold)
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlHeader);
    
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={isConnected ? "/dashboard" : "/"}>
            <a className="flex items-center gap-2 font-bold text-xl hover-elevate active-elevate-2 px-2 py-1 rounded-md" data-testid="link-home">
              {/* <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
                LR
              </div> */}
              <img src={LocalRamp} alt="Local Ramp Logo" width={40} height={40} />
              <span className="hidden sm:inline">LOCAL RAMP</span>
            </a>
          </Link>

          {isConnected && (
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover-elevate active-elevate-2 ${
                      location === item.path
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`link-nav-${item.name.toLowerCase().replace(/ /g, "-")}`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <>
              <WalletBadge />
              <Link href="/offers/create">
                <a className="hidden sm:inline-flex">
                  <Button size="sm" data-testid="button-create-offer-header">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                  </Button>
                </a>
              </Link>
            </>
          )}
          <ThemeToggle />

          {isConnected && (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-6">
                  {navigation.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <a
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-3 text-base font-medium rounded-md transition-colors hover-elevate active-elevate-2 ${
                          location === item.path
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.name}
                      </a>
                    </Link>
                  ))}
                  <Link href="/settings">
                    <a
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-base font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover-elevate active-elevate-2"
                    >
                      Settings
                    </a>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
