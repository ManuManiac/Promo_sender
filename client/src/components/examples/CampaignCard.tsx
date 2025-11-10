import CampaignCard from '../CampaignCard';

export default function CampaignCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <CampaignCard 
        id="1"
        name="Welcome Series"
        subject="Welcome to our platform!"
        recipients={1250}
        status="sent"
        sentDate="Nov 8, 2025"
        successRate={98.5}
        onEdit={() => console.log('Edit campaign')}
        onDelete={() => console.log('Delete campaign')}
      />
      <CampaignCard 
        id="2"
        name="Product Launch"
        subject="Introducing our new product"
        recipients={3450}
        status="draft"
        onEdit={() => console.log('Edit campaign')}
        onSend={() => console.log('Send campaign')}
        onDelete={() => console.log('Delete campaign')}
      />
      <CampaignCard 
        id="3"
        name="Monthly Newsletter"
        subject="Your monthly update is here"
        recipients={5200}
        status="sending"
        onEdit={() => console.log('Edit campaign')}
        onDelete={() => console.log('Delete campaign')}
      />
    </div>
  );
}
