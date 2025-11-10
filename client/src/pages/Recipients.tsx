import { useState } from "react";
import RecipientUpload from "@/components/RecipientUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MoreVertical, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RecipientList {
  id: string;
  name: string;
  count: number;
  createdAt: string;
}

export default function Recipients() {
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);

  const { data: recipientLists = [], isLoading } = useQuery<RecipientList[]>({
    queryKey: ["/api/recipient-lists"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (listId: string) => {
      return apiRequest("DELETE", `/api/recipient-lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipient-lists"] });
      toast({ title: "List deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete list",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteList = (listId: string) => {
    if (confirm("Are you sure you want to delete this list?")) {
      deleteMutation.mutate(listId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Recipient Lists</h1>
          <p className="text-muted-foreground mt-1">Manage your email recipient lists</p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} data-testid="button-new-list">
          <Plus className="h-4 w-4 mr-2" />
          {showUpload ? "Hide Upload" : "New List"}
        </Button>
      </div>

      {showUpload && (
        <RecipientUpload onSuccess={() => {
          setShowUpload(false);
          queryClient.invalidateQueries({ queryKey: ["/api/recipient-lists"] });
        }} />
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Saved Lists</h2>
        {recipientLists.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recipient lists yet</h3>
            <p className="text-muted-foreground mb-4">Create your first list to start sending campaigns</p>
            <Button onClick={() => setShowUpload(true)} data-testid="button-create-first-list">
              <Plus className="h-4 w-4 mr-2" />
              Create First List
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipientLists.map((list) => (
              <Card key={list.id} className="hover-elevate" data-testid={`card-list-${list.id}`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base font-semibold" data-testid="text-list-name">{list.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {list.count.toLocaleString()} recipients
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-list-menu">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem data-testid="menu-view">View</DropdownMenuItem>
                      <DropdownMenuItem data-testid="menu-export">Export</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive" 
                        onClick={() => handleDeleteList(list.id)}
                        data-testid="menu-delete"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(list.createdAt), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
