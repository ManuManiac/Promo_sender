import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MoreVertical, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TemplateCardProps {
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export default function TemplateCard({
  id,
  name,
  thumbnail,
  createdAt,
  onEdit,
  onDelete,
  onDuplicate
}: TemplateCardProps) {
  return (
    <Card className="hover-elevate group" data-testid={`card-template-${id}`}>
      <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden rounded-t-lg">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Mail className="h-12 w-12 text-muted-foreground" />
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button onClick={onEdit} size="sm" data-testid="button-template-edit">
            Edit
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate" data-testid="text-template-name">{name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              {createdAt}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-template-menu">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} data-testid="menu-edit">Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate} data-testid="menu-duplicate">Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid="menu-delete">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
