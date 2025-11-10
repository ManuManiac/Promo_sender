import { useState } from "react";
import SendProgress from "@/components/SendProgress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send as SendIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Send() {
  const [campaign, setCampaign] = useState<string>("");
  const [recipientList, setRecipientList] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  const mockLogs = [
    { id: '1', email: 'user1@example.com', status: 'sent' as const, provider: 'SendPulse', timestamp: '2 mins ago' },
    { id: '2', email: 'user2@example.com', status: 'sent' as const, provider: 'SendPulse', timestamp: '2 mins ago' },
    { id: '3', email: 'user3@example.com', status: 'failed' as const, provider: 'Brevo', timestamp: '1 min ago', error: 'Invalid email address' },
    { id: '4', email: 'user4@example.com', status: 'sent' as const, provider: 'Mailjet', timestamp: '1 min ago' },
    { id: '5', email: 'user5@example.com', status: 'pending' as const, provider: 'SendPulse', timestamp: 'Just now' },
  ];

  const handleStartSend = () => {
    setIsSending(true);
    console.log('Starting send', { campaign, recipientList });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Send Campaign</h1>
        <p className="text-muted-foreground mt-1">Review and send your email campaign</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-send-config">
          <CardHeader>
            <CardTitle>Campaign Configuration</CardTitle>
            <CardDescription>Select campaign and recipient list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign</Label>
              <Select value={campaign} onValueChange={setCampaign}>
                <SelectTrigger id="campaign" data-testid="select-campaign">
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Series</SelectItem>
                  <SelectItem value="launch">Product Launch</SelectItem>
                  <SelectItem value="newsletter">Monthly Newsletter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipients">Recipient List</Label>
              <Select value={recipientList} onValueChange={setRecipientList}>
                <SelectTrigger id="recipients" data-testid="select-recipients">
                  <SelectValue placeholder="Select a recipient list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscribers">Newsletter Subscribers (5,432)</SelectItem>
                  <SelectItem value="launch-list">Product Launch List (1,250)</SelectItem>
                  <SelectItem value="vip">VIP Customers (324)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Distribution Plan</AlertTitle>
              <AlertDescription>
                Emails will be distributed across SendPulse, Brevo, and Mailjet based on available daily limits.
              </AlertDescription>
            </Alert>

            <Button 
              className="w-full" 
              size="lg"
              disabled={!campaign || !recipientList || isSending}
              onClick={handleStartSend}
              data-testid="button-start-send"
            >
              <SendIcon className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : 'Start Sending'}
            </Button>
          </CardContent>
        </Card>

        <SendProgress 
          total={1000}
          sent={isSending ? 687 : 0}
          failed={isSending ? 13 : 0}
          status={isSending ? 'processing' : 'queued'}
          logs={isSending ? mockLogs : []}
        />
      </div>
    </div>
  );
}
