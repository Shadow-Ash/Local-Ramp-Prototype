import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, AlertTriangle, Flag, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { BaseChainBadge } from "@/components/base-chain-badge";
import { formatCurrency, truncateAddress, getBaseScanUrl } from "@/lib/wallet-utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { useWallet } from "@/lib/contexts";

export default function OfferDetailPage() {
  const [, params] = useRoute("/offers/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useWallet();
  const [reportReason, setReportReason] = useState("");

  // Mock Farcaster data for offer creator
  const getOfferCreatorFarcaster = (userId: string) => ({
    fid: "12345",
    username: "cryptotrader",
    displayName: "CryptoTrader",
    avatarUrl: "https://i.pravatar.cc/300?img=68",
  });

  const { data: offer, isLoading } = useQuery({
    queryKey: ["/api/offers", params?.id],
    queryFn: () => apiClient.offers.get(params!.id),
    enabled: !!params?.id,
  });

  const reportMutation = useMutation({
    mutationFn: (data: { offerId: string; reason: string; description: string }) =>
      apiClient.reports.create(data),
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "We'll review this offer shortly",
      });
      setReportReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  const createDealMutation = useMutation({
    mutationFn: (data: any) => apiClient.deals.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Deal Initiated",
        description: "You can now coordinate with the counterparty",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate deal",
        variant: "destructive",
      });
    },
  });

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    reportMutation.mutate({
      offerId: params!.id,
      reason: "Suspicious offer",
      description: reportReason,
    });
  };

  const handleInitiateDeal = () => {
    if (!offer || !currentUser) return;
    
    const dealData = {
      offerId: offer.id,
      buyerId: offer.type === "sell" ? currentUser.id : offer.userId,
      sellerId: offer.type === "buy" ? currentUser.id : offer.userId,
      amount: offer.amount,
      status: "active" as const,
    };
    
    createDealMutation.mutate(dealData);
  };

  const getWarpcastUrl = (username: string) => `https://warpcast.com/${username}`;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Offer not found</p>
          <Button onClick={() => setLocation("/offers")}>Browse Offers</Button>
        </div>
      </div>
    );
  }

  const creatorFarcaster = getOfferCreatorFarcaster(offer.userId);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => setLocation("/offers")}
        className="mb-4"
        data-testid="button-back"
      >
        ← Back to Offers
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={offer.type === "buy" ? "default" : "secondary"} className="text-base">
                    {offer.type === "buy" ? "Buying" : "Selling"}
                  </Badge>
                  <BaseChainBadge />
                  {offer.isActive && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                      Active
                    </Badge>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid="button-report">
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Report Offer</DialogTitle>
                      <DialogDescription>
                        Help us maintain a safe marketplace by reporting suspicious offers
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Describe why you're reporting this offer..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        rows={5}
                        data-testid="input-report-reason"
                      />
                      <Button
                        onClick={handleReport}
                        disabled={reportMutation.isPending}
                        className="w-full"
                        data-testid="button-submit-report"
                      >
                        {reportMutation.isPending ? "Submitting..." : "Submit Report"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <CardTitle className="text-4xl mb-2">
                ${formatCurrency(offer.amount)} USDC
              </CardTitle>
              <CardDescription className="text-base">
                Limits: ${offer.minLimit} - ${offer.maxLimit}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{offer.location}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>Posted {new Date(offer.createdAt).toLocaleDateString()}</span>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Payment Methods</h3>
                <div className="flex flex-wrap gap-2">
                  {offer.paymentMethods?.map((method: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>

              {offer.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {offer.description}
                    </p>
                  </div>
                </>
              )}

              {offer.baseChainTxHash && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">BASE Chain Verification</h3>
                    <a
                      href={getBaseScanUrl(offer.baseChainTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-mono"
                      data-testid="link-tx-hash"
                    >
                      {truncateAddress(offer.baseChainTxHash, 10, 8)}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Alert className="bg-amber-500/10 border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-200">
              <strong>Safety Reminder:</strong> Only meet in public places during daylight hours. Never send cryptocurrency before meeting in person. Trust your instincts.
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trader Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={creatorFarcaster.avatarUrl} />
                  <AvatarFallback className="text-xl">
                    {creatorFarcaster.displayName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">
                    {creatorFarcaster.displayName}
                  </div>
                  <a
                    href={getWarpcastUrl(creatorFarcaster.username)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    data-testid="link-user-profile"
                  >
                    @{creatorFarcaster.username}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    FID: {creatorFarcaster.fid}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {offer.user?.isVerified && (
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verified on Farcaster</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleInitiateDeal}
            disabled={createDealMutation.isPending || offer.userId === currentUser?.id}
            size="lg"
            className="w-full"
            data-testid="button-initiate-deal"
          >
            {createDealMutation.isPending ? "Initiating..." : "Initiate Deal"}
          </Button>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-xs text-center space-y-2">
                <p className="text-muted-foreground">
                  Powered by BASE Chain
                </p>
                <p className="text-muted-foreground">
                  Fast • Secure • Decentralized
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
