import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Edit, Save, X, ExternalLink, CheckCircle, TrendingUp, Users } from "lucide-react";
import { useWallet } from "@/lib/contexts";
import { useToast } from "@/hooks/use-toast";
import { BaseChainBadge } from "@/components/base-chain-badge";

export default function ProfilePage() {
  const { user } = useWallet();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock Farcaster data
  const farcasterProfile = {
    fid: "12345",
    username: "cryptoTrader",
    displayName: "Crypto Trader",
    avatarUrl: "https://i.pravatar.cc/300?img=68",
    followerCount: 1250,
    followingCount: 340,
  };

  const [formData, setFormData] = useState({
    displayName: farcasterProfile.displayName,
    bio: "Experienced crypto trader on BASE Chain. Available for quick meetups in Manhattan.",
    location: "Mumbai",
    Telegram: "@cryptoTrader",
  });

  const stats = {
    trustScore: 4.8,
    completedDeals: 23,
    activeOffers: 3,
    onFarcasterSince: "December 2023",
    isVerified: true,
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getWarpcastUrl = (username: string) => `https://warpcast.com/${username}`;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your BASE Chain trading profile</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={farcasterProfile.avatarUrl} />
                    <AvatarFallback className="text-2xl">
                      {formData.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{formData.displayName}</h2>
                    <a
                      href={getWarpcastUrl(farcasterProfile.username)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-1"
                      data-testid="link-farcaster-profile"
                    >
                      @{farcasterProfile.username}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <div className="text-xs text-muted-foreground font-mono">
                      FID: {farcasterProfile.fid}
                    </div>
                  </div>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    data-testid="button-edit"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="ghost"
                      size="sm"
                      data-testid="button-cancel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      size="sm"
                      data-testid="button-save"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <>
                  <div>
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="mt-1">{formData.bio}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="mt-1">{formData.location}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Telegram</Label>
                      <p className="mt-1">{formData.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{farcasterProfile.followerCount}</span>
                      <span>followers</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="font-medium">{farcasterProfile.followingCount}</span>
                      <span>following</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      data-testid="input-display-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      data-testid="input-bio"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        data-testid="input-location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telegram</Label>
                      <Input
                        id="phone"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Stats</CardTitle>
              <CardDescription>Your activity on BASE Chain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{stats.completedDeals}</div>
                  <div className="text-sm text-muted-foreground">Completed Deals</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{stats.activeOffers}</div>
                  <div className="text-sm text-muted-foreground">Active Offers</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{stats.trustScore}/5.0</div>
                  <div className="text-sm text-muted-foreground">Trust Score</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{stats.onFarcasterSince}</div>
                  <div className="text-sm text-muted-foreground">On Farcaster since</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <BaseChainBadge />
              {stats.isVerified && (
                <Badge variant="outline" className="w-full justify-center bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                  <CheckCircle className="h-3 w-3 mr-1.5" />
                  Verified on Farcaster
                </Badge>
              )}
              {stats.completedDeals > 20 && (
                <Badge variant="outline" className="w-full justify-center bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                  <TrendingUp className="h-3 w-3 mr-1.5" />
                  Power Trader
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-sm space-y-3">
                <h4 className="font-semibold">Safety Tips</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Always meet in public places</li>
                  <li>• Verify transactions on BASE scan</li>
                  <li>• Never share private keys</li>
                  <li>• Trust your instincts</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
