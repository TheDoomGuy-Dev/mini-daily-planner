import type { TaskTemplate } from '../../types';
import PriorityBadge from '../common/PriorityBadge';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal, Edit3, Trash2, Play } from 'lucide-react';
import { getRecurrenceDescription } from '../../utils/recurrence';

interface TemplateCardProps {
  template: TaskTemplate;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-card-title text-foreground truncate">{template.name}</h3>
            <PriorityBadge priority={template.priority} />
          </div>

          {template.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {template.category && (
              <Badge variant="secondary" className="text-xs">
                {template.category}
              </Badge>
            )}
            {template.recurrence && (
              <span className="text-xs text-muted-foreground">
                🔄 {getRecurrenceDescription(template.recurrence)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button size="sm" onClick={onUse}>
            <Play className="h-4 w-4 mr-1" />
            Use Template
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Template actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
