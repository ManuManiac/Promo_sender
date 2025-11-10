import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Users, Calendar, MoreVertical, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CampaignCardProps {
  id: string;
  name: string;
  subject: string;
  recipients: number;
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
  sentDate?: string;
  successRate?: number;
  onEdit?: () => void;
  onSend?: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  sending: { label: 'Sending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  sent: { label: 'Sent', className: 'bg-green-100 text-green-700 border-green-200' }
};

export default function CampaignCard({
  id,
  name,
  subject,
  recipients,
  status,
  sentDate,
  successRate,
  onEdit,
  onSend,
  onDelete
}: CampaignCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-campaign-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base font-semibold" data-testid="text-campaign-name">{name}</CardTitle>
            <Badge variant="outline" className={statusConfig[status].className} data-testid="badge-campaign-status">
              {statusConfig[status].label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1" data-testid="text-campaign-subject">
            <Mail className="h-3 w-3" />
            {subject}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-campaign-menu">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} data-testid="menu-edit">Edit</DropdownMenuItem>
            {status === 'draft' && (
              <DropdownMenuItem onClick={onSend} data-testid="menu-send">Send</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid="menu-delete">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1" data-testid="text-recipients">
            <Users className="h-3 w-3" />
            <span>{recipients.toLocaleString()} recipients</span>
          </div>
          {sentDate && (
            <div className="flex items-center gap-1" data-testid="text-sent-date">
              <Calendar className="h-3 w-3" />
              <span>{sentDate}</span>
            </div>
          )}
        </div>
        {successRate !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="text-sm font-medium text-green-600" data-testid="text-success-rate">{successRate}%</span>
          </div>
        )}
        {status === 'draft' && (
          <Button onClick={onSend} className="w-full" size="sm" data-testid="button-send-campaign">
            <Send className="h-3 w-3 mr-1" />
            Send Campaign
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
