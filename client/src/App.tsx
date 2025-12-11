import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, WalletProvider, useWallet } from "@/lib/contexts";
import { Header } from "@/components/header";
import NotFound from "@/pages/not-found";
import ConnectWalletPage from "@/pages/connect-wallet";
import DashboardPage from "@/pages/dashboard";
import CreateOfferPage from "@/pages/create-offer";
import BrowseOffersPage from "@/pages/browse-offers";
import OfferDetailPage from "@/pages/offer-detail";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import HelpPage from "@/pages/help";
import HistoryPage from "@/pages/history";
import AdminPage from "@/pages/admin";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isConnected } = useWallet();
  
  if (!isConnected) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  const { isConnected } = useWallet();
  
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex-1 pt-16">
        <Switch>
          <Route path="/">
            {isConnected ? <Redirect to="/dashboard" /> : <ConnectWalletPage />}
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute component={DashboardPage} />
          </Route>
          <Route path="/offers">
            <ProtectedRoute component={BrowseOffersPage} />
          </Route>
          <Route path="/offers/create">
            <ProtectedRoute component={CreateOfferPage} />
          </Route>
          <Route path="/offers/:id">
            <ProtectedRoute component={OfferDetailPage} />
          </Route>
          <Route path="/profile">
            <ProtectedRoute component={ProfilePage} />
          </Route>
          <Route path="/settings">
            <ProtectedRoute component={SettingsPage} />
          </Route>
          <Route path="/history">
            <ProtectedRoute component={HistoryPage} />
          </Route>
          <Route path="/help">
            <HelpPage />
          </Route>
          <Route path="/admin">
            <ProtectedRoute component={AdminPage} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="border-t py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">Powered by BASE Chain • Fast, Secure, Decentralized</p>
          <p className="text-xs">
            Local Ramp is a peer-to-peer marketplace. No escrow services provided. Trade at your own risk.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
