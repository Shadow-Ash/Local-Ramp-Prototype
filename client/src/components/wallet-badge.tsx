import { useWallet } from "@/lib/contexts";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

// Mock Farcaster data
const mockFarcasterProfile = {
  fid: "12345",
  username: "cryptotrader",
};

export function WalletBadge() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return null;
  }

  const getWarpcastUrl = (username: string) => `https://warpcast.com/${username}`;

  return (
    <a
      href={getWarpcastUrl(mockFarcasterProfile.username)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 hover-elevate active-elevate-2"
      data-testid="link-farcaster-badge"
    >
      <Badge variant="secondary" className="font-mono text-xs gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        @{mockFarcasterProfile.username}
        <ExternalLink className="h-3 w-3" />
      </Badge>
    </a>
  );
}
