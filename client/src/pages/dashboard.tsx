import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, CheckCircle, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { BaseChainBadge } from "@/components/base-chain-badge";
import { formatCurrency } from "@/lib/wallet-utils";
import { apiClient } from "@/lib/api-client";
import { useWallet } from "@/lib/contexts";

// Rest of the file remains exactly the same...


export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useWallet();

  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ["/api/offers", user?.id],
    queryFn: () => apiClient.offers.list({ userId: user?.id }),
    enabled: !!user,
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["/api/deals"],
    queryFn: () => apiClient.deals.list(),
    enabled: !!user,
  });

  const activeOffers = offers.filter((o: any) => o.isActive);
  const activeDeals = deals.filter((d: any) => d.status === "active");
  const completedDeals = deals.filter((d: any) => d.status === "completed");

  const stats = {
    activeOffers: activeOffers.length,
    completedDeals: completedDeals.length,
    trustScore: 4.8,
    totalVolume: "0.00",
  };

  if (offersLoading || dealsLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your trading activity on BASE Chain</p>
        </div>
        <Button onClick={() => setLocation("/offers/create")} data-testid="button-create-offer">
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOffers}</div>
            <p className="text-xs text-muted-foreground">Currently listed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Deals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDeals}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trustScore}/5.0</div>
            <p className="text-xs text-muted-foreground">Community rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <BaseChainBadge />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(stats.totalVolume)}</div>
            <p className="text-xs text-muted-foreground">USDC traded</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="offers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="offers" data-testid="tab-offers">My Offers</TabsTrigger>
          <TabsTrigger value="deals" data-testid="tab-deals">Active Deals</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          {activeOffers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No active offers</p>
                <Button onClick={() => setLocation("/offers/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Offer
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeOffers.map((offer: any) => (
              <Card key={offer.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={offer.type === "buy" ? "default" : "secondary"}>
                          {offer.type === "buy" ? "Buying" : "Selling"}
                        </Badge>
                        {offer.isActive && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">
                        ${formatCurrency(offer.amount)} USDC
                      </CardTitle>
                      <CardDescription>{offer.location}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setLocation(`/offers/${offer.id}`)}>
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Created {new Date(offer.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          {activeDeals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No active deals</p>
              </CardContent>
            </Card>
          ) : (
            activeDeals.map((deal: any) => (
              <Card key={deal.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                          In Progress
                        </Badge>
                        <BaseChainBadge />
                      </div>
                      <CardTitle className="text-xl">
                        ${formatCurrency(deal.amount)} USDC
                      </CardTitle>
                      <CardDescription>
                        Deal #{deal.id.slice(0, 8)}
                      </CardDescription>
                    </div>
                    <Button onClick={() => setLocation(`/deals/${deal.id}`)}>
                      View Deal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Started {new Date(deal.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your completed and cancelled deals</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/history")}>
                View Full History
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
