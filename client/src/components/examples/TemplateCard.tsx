import TemplateCard from '../TemplateCard';

export default function TemplateCardExample() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <TemplateCard 
        id="1"
        name="Welcome Email"
        createdAt="Nov 5, 2025"
        onEdit={() => console.log('Edit template')}
        onDelete={() => console.log('Delete template')}
        onDuplicate={() => console.log('Duplicate template')}
      />
      <TemplateCard 
        id="2"
        name="Product Launch Newsletter"
        createdAt="Nov 8, 2025"
        onEdit={() => console.log('Edit template')}
        onDelete={() => console.log('Delete template')}
        onDuplicate={() => console.log('Duplicate template')}
      />
      <TemplateCard 
        id="3"
        name="Monthly Update"
        createdAt="Nov 10, 2025"
        onEdit={() => console.log('Edit template')}
        onDelete={() => console.log('Delete template')}
        onDuplicate={() => console.log('Duplicate template')}
      />
    </div>
  );
}
