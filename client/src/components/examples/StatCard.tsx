import StatCard from '../StatCard';
import { Mail, Users, Send, TrendingUp } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatCard 
        title="Total Campaigns" 
        value={24} 
        description="Active campaigns"
        icon={Mail}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard 
        title="Total Recipients" 
        value="12,543" 
        description="Across all lists"
        icon={Users}
      />
      <StatCard 
        title="Emails Sent" 
        value="45,231" 
        description="This month"
        icon={Send}
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard 
        title="Success Rate" 
        value="98.5%" 
        description="Delivery rate"
        icon={TrendingUp}
        trend={{ value: 2, isPositive: true }}
      />
    </div>
  );
}
