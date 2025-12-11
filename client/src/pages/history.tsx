import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
import { BaseChainBadge } from "@/components/base-chain-badge";
import { formatCurrency, truncateAddress, getBaseScanUrl } from "@/lib/wallet-utils";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const mockDeals = [
    {
      id: "1",
      type: "buy" as const,
      amount: "250.00",
      counterparty: "0x1234567890123456789012345678901234567890",
      status: "completed" as const,
      baseChainTxHash: "0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      createdAt: "2024-01-15",
      completedAt: "2024-01-15",
    },
    {
      id: "2",
      type: "sell" as const,
      amount: "500.00",
      counterparty: "0x2345678901234567890123456789012345678901",
      status: "completed" as const,
      baseChainTxHash: "0xbcde2345678901bcdef2345678901bcdef2345678901bcdef2345678901bc",
      createdAt: "2024-01-14",
      completedAt: "2024-01-14",
    },
    {
      id: "3",
      type: "buy" as const,
      amount: "1000.00",
      counterparty: "0x3456789012345678901234567890123456789012",
      status: "cancelled" as const,
      baseChainTxHash: null,
      createdAt: "2024-01-13",
      completedAt: null,
    },
    {
      id: "4",
      type: "sell" as const,
      amount: "150.00",
      counterparty: "0x4567890123456789012345678901234567890123",
      status: "active" as const,
      baseChainTxHash: null,
      createdAt: "2024-01-16",
      completedAt: null,
    },
  ];

  const filteredDeals = mockDeals.filter((deal) =>
    filterStatus === "all" ? true : deal.status === filterStatus
  );

  const handleExport = () => {
    const csv = [
      ["ID", "Type", "Amount", "Counterparty", "Status", "TX Hash", "Created", "Completed"].join(","),
      ...filteredDeals.map((deal) =>
        [
          deal.id,
          deal.type,
          deal.amount,
          deal.counterparty,
          deal.status,
          deal.baseChainTxHash || "N/A",
          deal.createdAt,
          deal.completedAt || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `local-ramp-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Export Complete",
      description: "Transaction history downloaded",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "active":
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
            Cancelled
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
            Active
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">View all your deals on BASE Chain</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px]" data-testid="select-filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <BaseChainBadge />
            </div>
            <Button onClick={handleExport} variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deals ({filteredDeals.length})</CardTitle>
          <CardDescription>All transactions with BASE Chain verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>BASE TX</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeals.map((deal) => (
                    <TableRow key={deal.id} data-testid={`row-deal-${deal.id}`}>
                      <TableCell className="font-medium">{deal.createdAt}</TableCell>
                      <TableCell>
                        <Badge variant={deal.type === "buy" ? "default" : "secondary"}>
                          {deal.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        ${formatCurrency(deal.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {truncateAddress(deal.counterparty)}
                      </TableCell>
                      <TableCell>{getStatusBadge(deal.status)}</TableCell>
                      <TableCell>
                        {deal.baseChainTxHash ? (
                          <a
                            href={getBaseScanUrl(deal.baseChainTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                            data-testid={`link-tx-${deal.id}`}
                          >
                            {truncateAddress(deal.baseChainTxHash, 6, 4)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredDeals.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No transactions found</div>
            ) : (
              filteredDeals.map((deal) => (
                <Card key={deal.id} data-testid={`card-deal-${deal.id}`}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deal.status)}
                        {getStatusBadge(deal.status)}
                      </div>
                      <Badge variant={deal.type === "buy" ? "default" : "secondary"}>
                        {deal.type}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold font-mono">
                      ${formatCurrency(deal.amount)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>With {truncateAddress(deal.counterparty)}</div>
                      <div>{deal.createdAt}</div>
                    </div>
                    {deal.baseChainTxHash && (
                      <a
                        href={getBaseScanUrl(deal.baseChainTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                      >
                        View on BASE Scan
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
