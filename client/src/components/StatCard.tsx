import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" data-testid="icon-stat" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid="text-stat-value">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1" data-testid="text-stat-description">
            {description}
          </p>
        )}
        {trend && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`} data-testid="text-stat-trend">
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
