import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, FileText, AlertCircle, TrendingUp, Search, Ban, CheckCircle, XCircle } from "lucide-react";
import { BaseChainBadge } from "@/components/base-chain-badge";
import { formatCurrency, truncateAddress } from "@/lib/wallet-utils";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const stats = {
    totalUsers: 1247,
    activeOffers: 89,
    pendingReports: 5,
    totalVolume: "542,389.50",
  };

  const mockUsers = [
    {
      id: "1",
      walletAddress: "0x1234567890123456789012345678901234567890",
      displayName: "CryptoTrader",
      completedDeals: 23,
      trustScore: 4.8,
      isVerified: true,
      isSuspended: false,
      createdAt: "2023-12-01",
    },
    {
      id: "2",
      walletAddress: "0x2345678901234567890123456789012345678901",
      displayName: "BaseTrader",
      completedDeals: 12,
      trustScore: 4.5,
      isVerified: true,
      isSuspended: false,
      createdAt: "2024-01-05",
    },
    {
      id: "3",
      walletAddress: "0x3456789012345678901234567890123456789012",
      displayName: null,
      completedDeals: 3,
      trustScore: 3.2,
      isVerified: false,
      isSuspended: true,
      createdAt: "2024-01-10",
    },
  ];

  const mockReports = [
    {
      id: "1",
      reporterAddress: "0x1234567890123456789012345678901234567890",
      offerId: "off_123",
      reason: "Suspicious behavior",
      status: "pending" as const,
      createdAt: "2024-01-16",
    },
    {
      id: "2",
      reporterAddress: "0x2345678901234567890123456789012345678901",
      offerId: "off_456",
      reason: "Scam attempt",
      status: "pending" as const,
      createdAt: "2024-01-15",
    },
  ];

  const handleSuspendUser = (userId: string) => {
    toast({
      title: "User Suspended",
      description: "Account has been suspended",
    });
  };

  const handleVerifyUser = (userId: string) => {
    toast({
      title: "User Verified",
      description: "Verification badge added",
    });
  };

  const handleResolveReport = (reportId: string, action: "approve" | "reject") => {
    toast({
      title: action === "approve" ? "Report Approved" : "Report Rejected",
      description: `Report has been ${action === "approve" ? "resolved" : "dismissed"}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform management and oversight</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOffers}</div>
            <p className="text-xs text-muted-foreground">Across all regions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(stats.totalVolume)}</div>
            <div className="flex items-center gap-1 mt-1">
              <BaseChainBadge />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Search and manage platform users</CardDescription>
                </div>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by wallet or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-[300px]"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Trust</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.displayName || "Anonymous"}
                          </div>
                          <div className="text-xs font-mono text-muted-foreground">
                            {truncateAddress(user.walletAddress)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.completedDeals}</TableCell>
                      <TableCell>{user.trustScore}/5.0</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.isVerified && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                              Verified
                            </Badge>
                          )}
                          {user.isSuspended && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                              Suspended
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!user.isVerified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyUser(user.id)}
                              data-testid={`button-verify-${user.id}`}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verify
                            </Button>
                          )}
                          {!user.isSuspended ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSuspendUser(user.id)}
                              data-testid={`button-suspend-${user.id}`}
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuspendUser(user.id)}
                            >
                              Unsuspend
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reports</CardTitle>
              <CardDescription>Review and resolve user reports</CardDescription>
            </CardHeader>
            <CardContent>
              {mockReports.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No pending reports
                </div>
              ) : (
                <div className="space-y-4">
                  {mockReports.map((report) => (
                    <Card key={report.id} data-testid={`card-report-${report.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                                Pending Review
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {report.createdAt}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium mb-1">{report.reason}</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Offer ID: {report.offerId}</div>
                                <div className="font-mono">
                                  Reporter: {truncateAddress(report.reporterAddress)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveReport(report.id, "reject")}
                              data-testid={`button-reject-${report.id}`}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleResolveReport(report.id, "approve")}
                              data-testid={`button-approve-${report.id}`}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>User registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg flex items-center justify-center h-[300px] border-2 border-dashed">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Charts coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Volume</CardTitle>
                <CardDescription>BASE Chain activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg flex items-center justify-center h-[300px] border-2 border-dashed">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Charts coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
