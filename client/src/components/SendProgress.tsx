import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SendLog {
  id: string;
  email: string;
  status: 'sent' | 'failed' | 'pending';
  provider: string;
  timestamp: string;
  error?: string;
}

interface SendProgressProps {
  total: number;
  sent: number;
  failed: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  logs: SendLog[];
}

export default function SendProgress({ total, sent, failed, status, logs }: SendProgressProps) {
  const percentage = total > 0 ? ((sent + failed) / total) * 100 : 0;
  const pending = total - sent - failed;

  const statusConfig = {
    queued: { label: 'Queued', icon: Clock, className: 'bg-blue-100 text-blue-700 border-blue-200' },
    processing: { label: 'Sending', icon: Send, className: 'bg-amber-100 text-amber-700 border-amber-200' },
    completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-200' },
    failed: { label: 'Failed', icon: AlertCircle, className: 'bg-red-100 text-red-700 border-red-200' }
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <Card data-testid="card-send-progress">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Send Progress</CardTitle>
        <Badge variant="outline" className={statusConfig[status].className} data-testid="badge-send-status">
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig[status].label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium" data-testid="text-progress">{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-3" data-testid="progress-send" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600" data-testid="text-sent">{sent}</div>
              <div className="text-xs text-muted-foreground">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600" data-testid="text-failed">{failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600" data-testid="text-pending">{pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Recent Activity</h4>
          <ScrollArea className="h-64 rounded-md border p-3" data-testid="scroll-logs">
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2 rounded-md hover-elevate text-sm"
                  data-testid={`log-${log.id}`}
                >
                  {log.status === 'sent' && <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />}
                  {log.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />}
                  {log.status === 'pending' && <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{log.email}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span>{log.provider}</span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                    {log.error && (
                      <div className="text-xs text-red-600 mt-1">{log.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
