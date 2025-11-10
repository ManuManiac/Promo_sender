import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProviderStatusProps {
  provider: 'sendpulse' | 'brevo' | 'mailjet';
  used: number;
  limit: number;
  status: 'available' | 'limited' | 'full';
}

const providerNames = {
  sendpulse: 'SendPulse',
  brevo: 'Brevo',
  mailjet: 'Mailjet'
};

const providerColors = {
  sendpulse: 'bg-blue-500',
  brevo: 'bg-purple-500',
  mailjet: 'bg-green-500'
};

export default function ProviderStatus({ provider, used, limit, status }: ProviderStatusProps) {
  const percentage = (used / limit) * 100;
  
  const statusBadge = {
    available: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" data-testid="badge-status">Available</Badge>,
    limited: <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200" data-testid="badge-status">Limited</Badge>,
    full: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" data-testid="badge-status">Full</Badge>
  };

  return (
    <Card data-testid={`card-provider-${provider}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${providerColors[provider]}`} />
          {providerNames[provider]}
        </CardTitle>
        {statusBadge[status]}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm" data-testid="text-usage">
          <span className="text-muted-foreground">Daily Usage</span>
          <span className="font-medium">{used.toLocaleString()} / {limit.toLocaleString()}</span>
        </div>
        <Progress value={percentage} className="h-2" data-testid="progress-usage" />
        <p className="text-xs text-muted-foreground" data-testid="text-remaining">
          {limit - used} emails remaining today
        </p>
      </CardContent>
    </Card>
  );
}
