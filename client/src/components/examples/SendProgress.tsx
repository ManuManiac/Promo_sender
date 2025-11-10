import SendProgress from '../SendProgress';

export default function SendProgressExample() {
  const mockLogs = [
    { id: '1', email: 'user1@example.com', status: 'sent' as const, provider: 'SendPulse', timestamp: '2 mins ago' },
    { id: '2', email: 'user2@example.com', status: 'sent' as const, provider: 'SendPulse', timestamp: '2 mins ago' },
    { id: '3', email: 'user3@example.com', status: 'failed' as const, provider: 'Brevo', timestamp: '1 min ago', error: 'Invalid email address' },
    { id: '4', email: 'user4@example.com', status: 'sent' as const, provider: 'Mailjet', timestamp: '1 min ago' },
    { id: '5', email: 'user5@example.com', status: 'pending' as const, provider: 'SendPulse', timestamp: 'Just now' },
    { id: '6', email: 'user6@example.com', status: 'sent' as const, provider: 'Brevo', timestamp: 'Just now' },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <SendProgress 
        total={1000}
        sent={687}
        failed={13}
        status="processing"
        logs={mockLogs}
      />
    </div>
  );
}
