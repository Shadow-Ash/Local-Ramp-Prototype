import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, DollarSign, TrendingUp } from "lucide-react";
import { BaseChainBadge } from "@/components/base-chain-badge";
import { formatCurrency } from "@/lib/wallet-utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  type: z.enum(["buy", "sell"]),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  minLimit: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Min limit must be a positive number",
  }),
  maxLimit: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Max limit must be a positive number",
  }),
  exchangeRate: z.string().optional(),
  location: z.string().min(3, "Location is required"),
  description: z.string().optional(),
  paymentMethods: z.string().min(1, "At least one payment method is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateOfferPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "buy",
      amount: "",
      minLimit: "",
      maxLimit: "",
      exchangeRate: "",
      location: "",
      description: "",
      paymentMethods: "",
    },
  });

  const watchedValues = form.watch();

  const createOfferMutation = useMutation({
    mutationFn: (data: any) => apiClient.offers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Offer Created",
        description: "Your offer is now live on BASE Chain",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create offer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    const paymentMethodsArray = data.paymentMethods.split(",").map(m => m.trim());
    
    createOfferMutation.mutate({
      type: data.type,
      amount: data.amount,
      minLimit: data.minLimit,
      maxLimit: data.maxLimit,
      exchangeRate: data.exchangeRate || null,
      location: data.location,
      description: data.description || null,
      paymentMethods: paymentMethodsArray,
      isActive: true,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Offer</h1>
        <p className="text-muted-foreground">List a new buy or sell offer on BASE Chain</p>
      </div>

      <Alert className="mb-6 bg-amber-500/10 border-amber-500/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-900 dark:text-amber-200">
          <strong>Safety First:</strong> No escrow services provided. All trades must be conducted in person at public locations. Never send funds before meeting face-to-face.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Offer Details</CardTitle>
                  <CardDescription>Specify what you want to trade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-offer-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="buy">I want to Buy USDC</SelectItem>
                            <SelectItem value="sell">I want to Sell USDC</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (USDC)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="1000.00"
                              className="pl-9"
                              data-testid="input-amount"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Total amount you want to trade</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Limit</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="50"
                                className="pl-9"
                                data-testid="input-min-limit"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Limit</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="500"
                                className="pl-9"
                                data-testid="input-max-limit"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="exchangeRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exchange Rate (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="83.50"
                              className="pl-9"
                              data-testid="input-exchange-rate"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Current exchange rate (e.g., INR per USDC)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location & Payment</CardTitle>
                  <CardDescription>Where and how to trade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="New York, NY"
                              className="pl-9"
                              data-testid="input-location"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>City or neighborhood for meetup</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethods"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Methods</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Cash, Venmo, Zelle"
                            data-testid="input-payment-methods"
                          />
                        </FormControl>
                        <FormDescription>Comma-separated list</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Additional details or requirements..."
                            rows={4}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createOfferMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {createOfferMutation.isPending ? "Creating..." : "Create Offer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your offer will appear</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={watchedValues.type === "buy" ? "default" : "secondary"} className="text-sm">
                    {watchedValues.type === "buy" ? "Buying" : "Selling"}
                  </Badge>
                  <BaseChainBadge />
                </div>

                <div>
                  <div className="text-3xl font-bold mb-1">
                    ${watchedValues.amount ? formatCurrency(watchedValues.amount) : "0.00"} USDC
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Limits: ${watchedValues.minLimit || "0"} - ${watchedValues.maxLimit || "0"}
                  </div>
                  {watchedValues.exchangeRate && (
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Rate: {watchedValues.exchangeRate} per USDC
                    </div>
                  )}
                </div>

                {watchedValues.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{watchedValues.location}</span>
                  </div>
                )}

                {watchedValues.paymentMethods && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Payment Methods</div>
                    <div className="flex flex-wrap gap-2">
                      {watchedValues.paymentMethods.split(",").map((method, i) => (
                        <Badge key={i} variant="outline">
                          {method.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {watchedValues.description && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Description</div>
                    <p className="text-sm text-muted-foreground">{watchedValues.description}</p>
                  </div>
                )}
              </div>

              <Alert className="bg-primary/10 border-primary/20">
                <AlertDescription className="text-sm">
                  Your offer will be visible to all users on BASE Chain marketplace
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
