import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/lib/contexts";
import { Bell, Shield, Download, LogOut, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { disconnectWallet } = useWallet();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    showFarcasterId: true,
    notificationsEnabled: true,
    emailNotifications: false,
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your BASE Chain activity is being prepared",
    });
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setLocation("/");
    toast({
      title: "Disconnected",
      description: "Farcaster account disconnected successfully",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <CardDescription>Control what information is visible to others</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="farcaster-visibility">Show Farcaster ID</Label>
                <p className="text-sm text-muted-foreground">
                  Display your Farcaster ID (FID) on profile and offers
                </p>
              </div>
              <Switch
                id="farcaster-visibility"
                checked={settings.showFarcasterId}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, showFarcasterId: checked })
                }
                data-testid="switch-farcaster-visibility"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for new deals and messages
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notificationsEnabled: checked })
                }
                data-testid="switch-notifications"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get updates via email for important activities
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
                data-testid="switch-email-notifications"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              <CardTitle>Data Export</CardTitle>
            </div>
            <CardDescription>Download your BASE Chain activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full"
              data-testid="button-export-data"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Activity as CSV
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} data-testid="button-save-settings">
            Save Changes
          </Button>
        </div>

        <Separator className="my-8" />

        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-destructive/10 border-destructive/20">
              <AlertDescription className="text-sm">
                Disconnecting your Farcaster account will log you out and clear your session data.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full"
              data-testid="button-disconnect"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect Farcaster
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
