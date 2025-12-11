import { Badge } from "@/components/ui/badge";

export function BaseChainBadge() {
  return (
    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
      BASE Chain
    </Badge>
  );
}
