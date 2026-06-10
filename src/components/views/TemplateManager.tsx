import { useState } from 'react';
import { useTemplates } from '../../hooks/useTemplates';
import type { TaskTemplate } from '../../types';
import TaskForm from '../tasks/TaskForm';
import TemplateCard from '../templates/TemplateCard';
import TemplateForm from '../templates/TemplateForm';
import EmptyState from '../common/EmptyState';
import { Button } from '../ui/button';
import { Plus, FileText } from 'lucide-react';

export default function TemplateManager() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateToUse, setTemplateToUse] = useState<{
    title: string;
    description: string;
    priority: TaskTemplate['priority'];
    category: string;
    recurrence: TaskTemplate['recurrence'];
  } | null>(null);

  const handleUseTemplate = (template: {
    name: string;
    description: string;
    priority: TaskTemplate['priority'];
    category: string;
    recurrence: TaskTemplate['recurrence'];
  }) => {
    setTemplateToUse({
      title: template.name,
      description: template.description,
      priority: template.priority,
      category: template.category,
      recurrence: template.recurrence,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-foreground">Templates</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="No templates yet"
          description="Save a task as a template to reuse it later."
          action={
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={() => handleUseTemplate({
                name: template.name,
                description: template.description,
                priority: template.priority,
                category: template.category,
                recurrence: template.recurrence,
              })}
              onEdit={() => setEditingTemplate(template.id)}
              onDelete={() => deleteTemplate(template.id)}
            />
          ))}
        </div>
      )}

      <TemplateForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={(data) => {
          addTemplate(data);
          setIsFormOpen(false);
        }}
      />

      {editingTemplate && (
        <TemplateForm
          open={!!editingTemplate}
          onOpenChange={(open) => { if (!open) setEditingTemplate(null); }}
          template={templates.find((t) => t.id === editingTemplate)}
          onSave={(data) => {
            if (editingTemplate) {
              updateTemplate(editingTemplate, data);
              setEditingTemplate(null);
            }
          }}
        />
      )}

      {/* TaskForm for creating a task from a template */}
      <TaskForm
        open={!!templateToUse}
        onOpenChange={(open) => { if (!open) setTemplateToUse(null); }}
        templateValues={templateToUse}
      />
    </div>
  );
}
