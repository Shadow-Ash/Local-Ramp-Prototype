import { useState } from "react";
import { useLocation } from "wouter";
import { useWallet } from "@/lib/contexts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Shield, Users, ArrowRight, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConnectFarcasterPage() {
  const [, setLocation] = useLocation();
  const { connectWallet } = useWallet();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  // Mock Farcaster connection
  const mockFarcasterProfile = {
    fid: "12345",
    username: "cryptotrader",
    displayName: "CryptoTrader",
    avatarUrl: "https://i.pravatar.cc/300?img=68",
    bio: "Experienced crypto trader on BASE Chain",
  };

  const handleConnectFarcaster = async () => {
    setIsConnecting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would authenticate with Farcaster
      // For now, we'll use a mock user object with Farcaster data
      connectWallet(mockFarcasterProfile.fid);
      
      toast({
        title: "Farcaster Connected",
        description: `Welcome, @${mockFarcasterProfile.username}!`,
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect Farcaster account",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-6 md:py-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center gap-3">
                <img
                  src="/Local-Ramp.svg"
                  width={100}
                  className="block"
                />
                <span className="text-6xl font-semibold tracking-tight">
                  Local Ramp
                </span>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground">
              P2P Crypto Trading on BASE Chain
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Powered by BASE Chain</span>
            </div>
          </div>

          <Alert className="bg-amber-500/10 border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-200">
              <strong>IRL Trading Only:</strong> No escrow services. Never send crypto before meeting in person. All trades are conducted in person at public locations <strong>AT YOUR OWN RISK.</strong>
            </AlertDescription>
          </Alert>

          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Connect Your Farcaster Account</CardTitle>
              <CardDescription>
                You need at least 100 followers to become eligible and log in to Local Ramp. A strong social credibility score is required to access the Marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleConnectFarcaster}
                disabled={isConnecting}
                size="lg"
                className="w-full justify-start gap-3 h-auto py-4"
                data-testid="button-connect-farcaster"
              >
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-foreground/20">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Connect Farcaster</div>
                  <div className="text-xs text-primary-foreground/80">Log in with Farcaster account</div>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">More info</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                <p>✓ One-click sign-up with Farcaster</p>
                <p>✓ Automatic profile creation from your Farcaster account</p>
                <p>✓ Verified identity on BASE Chain marketplace</p>
                <p>✓ Seamless p2p trading experience</p>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="ghost"
            onClick={() => setShowEducation(!showEducation)}
            className="w-full"
            data-testid="button-toggle-education"
          >
            Why BASE Chain? {showEducation ? "▲" : "▼"}
          </Button>

          {showEducation && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Layer 2 solution providing near-instant transaction confirmations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Secure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Built on Ethereum security with Coinbase backing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Social</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Farcaster integration for verified identity and social trust
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>By connecting, you agree to our Terms of Service and Privacy Policy</p>
            <p>Your Farcaster identity is verified and secure on BASE Chain</p>
          </div>
        </div>
      </div>
    </div>
  );
}
