import StatCard from "@/components/StatCard";
import ProviderStatus from "@/components/ProviderStatus";
import CampaignCard from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Mail, Send } from "lucide-react";

export default function Dashboard() {
  const handleCreateCampaign = () => {
    console.log('Create new campaign');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your email campaigns</p>
        </div>
        <Button onClick={handleCreateCampaign} data-testid="button-create-campaign">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div>
        <h2 className="text-xl font-semibold mb-4">Provider Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProviderStatus 
            provider="sendpulse" 
            used={156} 
            limit={400} 
            status="available"
          />
          <ProviderStatus 
            provider="brevo" 
            used={245} 
            limit={300} 
            status="limited"
          />
          <ProviderStatus 
            provider="mailjet" 
            used={200} 
            limit={200} 
            status="full"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CampaignCard 
            id="1"
            name="Welcome Series"
            subject="Welcome to our platform!"
            recipients={1250}
            status="sent"
            sentDate="Nov 8, 2025"
            successRate={98.5}
            onEdit={() => console.log('Edit campaign 1')}
            onDelete={() => console.log('Delete campaign 1')}
          />
          <CampaignCard 
            id="2"
            name="Product Launch"
            subject="Introducing our new product"
            recipients={3450}
            status="draft"
            onEdit={() => console.log('Edit campaign 2')}
            onSend={() => console.log('Send campaign 2')}
            onDelete={() => console.log('Delete campaign 2')}
          />
          <CampaignCard 
            id="3"
            name="Monthly Newsletter"
            subject="Your monthly update is here"
            recipients={5200}
            status="sending"
            onEdit={() => console.log('Edit campaign 3')}
            onDelete={() => console.log('Delete campaign 3')}
          />
        </div>
      </div>
    </div>
  );
}
