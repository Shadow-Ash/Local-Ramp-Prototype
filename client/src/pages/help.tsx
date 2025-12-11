import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Zap, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { BaseChainBadge } from "@/components/base-chain-badge";

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">Help & Safety Center</h1>
        <p className="text-xl text-muted-foreground">Learn how to trade safely on BASE Chain</p>
      </div>

      <Alert className="mb-8 bg-primary/10 border-primary/20">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>Platform Policy:</strong> Local Ramp facilitates peer-to-peer connections only. We do not hold funds, provide escrow services, or mediate disputes. All trades are in-person, at your own risk.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">What is BASE Chain?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              BASE is a secure, low-cost Ethereum Layer 2 blockchain built by Coinbase, offering fast transactions and low fees.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect your Farcaster account, browse offers, and arrange in-person meetups. All transactions verified on BASE Chain.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CheckCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Safety First</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Always meet in public, verify transactions on-chain, and never share private keys or send funds before meeting.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Essential Safety Checklist
          </CardTitle>
          <CardDescription>Follow these guidelines for every trade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Meet in Public Places</div>
                <p className="text-sm text-muted-foreground">
                  Choose busy coffee shops, malls, or banks during business hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Verify on BASE Scan</div>
                <p className="text-sm text-muted-foreground">
                  Always confirm transactions on{" "}
                  <a href="https://basescan.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    basescan.org <ExternalLink className="inline h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Start Small</div>
                <p className="text-sm text-muted-foreground">
                  Begin with smaller amounts to build trust before larger trades
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Check User Reputation</div>
                <p className="text-sm text-muted-foreground">
                  Review trust scores, completed deals, and Farcaster verification status
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Trust Your Instincts</div>
                <p className="text-sm text-muted-foreground">
                  If something feels wrong, walk away. Your safety is paramount
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I verify a BASE offer on-chain?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click on any offer to view its details</li>
                  <li>Look for the BASE Chain transaction hash</li>
                  <li>Click the hash to open BASE Scan in a new tab</li>
                  <li>Verify the transaction details match the offer</li>
                  <li>Confirm the wallet address belongs to the seller</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>What currencies can I trade?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Local Ramp exclusively supports USDC on BASE Chain. These are stablecoins pegged to the US Dollar. All offers must be denominated in these currencies.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Is there escrow or buyer protection?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No. Local Ramp does not provide escrow services or hold funds. All trades are peer-to-peer and in-person only. We connect buyers and sellers but do not mediate disputes or guarantee transactions. Trade at your own risk.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How do I build trust on the platform?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li>Complete your profile with accurate information</li>
                  <li>Get verified by connecting your Farcaster account</li>
                  <li>Successfully complete deals to build your trust score</li>
                  <li>Maintain good communication and follow through on commitments</li>
                  <li>Respond promptly and be professional</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>What payment methods are supported?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Payment methods are determined by individual traders. Common options include cash, upi, bank transfers, and other peer-to-peer payment apps. Always agree on payment method before meeting.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>How do I report a suspicious offer or user?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Click the "Report" button on any offer page. Provide detailed information about why you're reporting. Our team reviews all reports, and we log your Farcaster ID and timestamp for accountability on BASE Chain.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>Can I cancel a deal after initiating?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, but we encourage good communication. If you need to cancel, contact the other party as soon as possible. Frequent cancellations may affect your trust score.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>Why BASE Chain specifically?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                BASE Chain offers fast transaction confirmations, minimal fees, and strong security backed by Coinbase. It's ideal for peer-to-peer trading with quick settlement and low costs. All platform activity is verifiable on-chain.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center">
          <BaseChainBadge />
          <p className="text-sm text-muted-foreground mt-4">
            Built on BASE Chain for fast, secure, and transparent P2P trading
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
