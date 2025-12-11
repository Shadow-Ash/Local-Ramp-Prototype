import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Filter, Map, List, Loader2 } from "lucide-react";
import { BaseChainBadge } from "@/components/base-chain-badge";
import { formatCurrency, truncateAddress } from "@/lib/wallet-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { OfferMap } from "@/components/offer-map";


export default function BrowseOffersPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["/api/offers", { isActive: true }],
    queryFn: () => apiClient.offers.list({ isActive: true }),
  });

  const filteredOffers = offers.filter((offer: any) => {
    const matchesSearch =
      !searchQuery ||
      offer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.user?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType =
      filterType === "all" ||
      offer.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Browse Offers</h1>
        <p className="text-muted-foreground">Find local crypto traders on BASE Chain</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by location or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-filter-type">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offers</SelectItem>
                <SelectItem value="buy">Buy Offers</SelectItem>
                <SelectItem value="sell">Sell Offers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list" data-testid="tab-list">
            <List className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="map" data-testid="tab-map">
            <Map className="h-4 w-4 mr-2" />
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredOffers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No offers found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((offer: any) => (
                <Card
                  key={offer.id}
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => setLocation(`/offers/${offer.id}`)}
                  data-testid={`card-offer-${offer.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant={offer.type === "buy" ? "default" : "secondary"}>
                        {offer.type === "buy" ? "Buying" : "Selling"}
                      </Badge>
                      <BaseChainBadge />
                    </div>
                    <CardTitle className="text-2xl">
                      ${formatCurrency(offer.amount)}
                    </CardTitle>
                    <CardDescription>
                      USDC • ${offer.minLimit} - ${offer.maxLimit}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{offer.location}</span>
                    </div>

                    {offer.paymentMethods && offer.paymentMethods.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {offer.paymentMethods.map((method: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={offer.user?.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {offer.user?.displayName?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {offer.user?.displayName || truncateAddress(offer.user?.walletAddress || "", 4, 3)}
                          </span>
                          {offer.user?.isVerified && (
                            <Badge variant="outline" className="w-fit text-[10px] h-4 px-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Map View</CardTitle>
              <CardDescription>
                Showing {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''} on the map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CardContent className="">
              <OfferMap 
                offers={filteredOffers} 
                height="600px"
                onOfferClick={(offerId) => setLocation(`/offers/${offerId}`)}
              />
              </CardContent>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}