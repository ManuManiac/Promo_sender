import TemplateCard from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Template {
  id: string;
  name: string;
  createdAt: string;
}

export default function Templates() {
  const templates: Template[] = [
    { id: '1', name: 'Welcome Email', createdAt: 'Nov 5, 2025' },
    { id: '2', name: 'Product Launch Newsletter', createdAt: 'Nov 8, 2025' },
    { id: '3', name: 'Monthly Update', createdAt: 'Nov 10, 2025' },
    { id: '4', name: 'Promotional Campaign', createdAt: 'Nov 3, 2025' },
    { id: '5', name: 'Event Invitation', createdAt: 'Nov 1, 2025' },
    { id: '6', name: 'Survey Request', createdAt: 'Oct 28, 2025' },
  ];

  const handleCreateTemplate = () => {
    console.log('Create new template');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Templates</h1>
          <p className="text-muted-foreground mt-1">Manage your email templates</p>
        </div>
        <Button onClick={handleCreateTemplate} data-testid="button-create-template">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard 
            key={template.id}
            id={template.id}
            name={template.name}
            createdAt={template.createdAt}
            onEdit={() => console.log('Edit template', template.id)}
            onDelete={() => console.log('Delete template', template.id)}
            onDuplicate={() => console.log('Duplicate template', template.id)}
          />
        ))}
      </div>
    </div>
  );
}
