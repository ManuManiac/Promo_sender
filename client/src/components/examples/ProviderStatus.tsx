import ProviderStatus from '../ProviderStatus';

export default function ProviderStatusExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
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
  );
}
