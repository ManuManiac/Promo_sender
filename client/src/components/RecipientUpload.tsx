import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileSpreadsheet, Sheet, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface RecipientStats {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
}

interface ParsedRecipients {
  recipients: Array<{
    email: string;
    firstName?: string;
    lastName?: string;
    metadata?: Record<string, any>;
  }>;
}

interface RecipientUploadProps {
  onSuccess?: () => void;
}

export default function RecipientUpload({ onSuccess }: RecipientUploadProps) {
  const { toast } = useToast();
  const [listName, setListName] = useState("");
  const [manualEmails, setManualEmails] = useState("");
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [stats, setStats] = useState<RecipientStats | null>(null);
  const [parsedRecipients, setParsedRecipients] = useState<ParsedRecipients | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createListMutation = useMutation({
    mutationFn: async (data: { name: string; recipients: any[] }) => {
      // Create list
      const list = await apiRequest("POST", "/api/recipient-lists", { name: data.name });
      
      // Add recipients
      const result = await apiRequest("POST", `/api/recipient-lists/${list.id}/recipients`, {
        recipients: data.recipients
      });
      
      return { list, result };
    },
    onSuccess: (data) => {
      toast({ 
        title: "Success!", 
        description: `Added ${data.result.inserted} recipients to ${data.list.name}` 
      });
      setListName("");
      setManualEmails("");
      setSheetsUrl("");
      setStats(null);
      setParsedRecipients(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create list",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleManualValidate = () => {
    const emails = manualEmails.split(/[,\n]/).map(e => e.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter(e => emailRegex.test(e));
    
    // Deduplicate
    const seen = new Set<string>();
    const unique: string[] = [];
    let duplicateCount = 0;

    for (const email of validEmails) {
      const normalized = email.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(email);
      } else {
        duplicateCount++;
      }
    }
    
    const recipients = unique.map(email => ({ email }));
    setParsedRecipients({ recipients });
    
    setStats({
      total: emails.length,
      valid: unique.length,
      invalid: emails.length - validEmails.length,
      duplicates: duplicateCount
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx';
      
      if (fileType === 'csv') {
        const text = await file.text();
        const result = await apiRequest("POST", "/api/parse/csv", { fileContent: text });
        setParsedRecipients(result);
        setStats({
          total: result.totalRows,
          valid: result.validCount,
          invalid: result.invalidCount,
          duplicates: result.duplicateCount,
        });
      } else {
        const buffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const result = await apiRequest("POST", "/api/parse/xlsx", { fileContent: base64 });
        setParsedRecipients(result);
        setStats({
          total: result.totalRows,
          valid: result.validCount,
          invalid: result.invalidCount,
          duplicates: result.duplicateCount,
        });
      }
    } catch (error: any) {
      toast({
        title: "File parsing failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleSheets = async () => {
    if (!sheetsUrl) {
      toast({
        title: "URL required",
        description: "Please enter a Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await apiRequest("POST", "/api/import/google-sheets", { url: sheetsUrl });
      setParsedRecipients(result);
      setStats({
        total: result.totalRows,
        valid: result.validCount,
        invalid: result.invalidCount,
        duplicates: result.duplicateCount,
      });
    } catch (error: any) {
      toast({
        title: "Google Sheets import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveList = () => {
    if (!listName.trim()) {
      toast({
        title: "List name required",
        description: "Please enter a name for your recipient list",
        variant: "destructive",
      });
      return;
    }

    if (!parsedRecipients || parsedRecipients.recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add some recipients first",
        variant: "destructive",
      });
      return;
    }

    createListMutation.mutate({
      name: listName,
      recipients: parsedRecipients.recipients,
    });
  };

  return (
    <Card data-testid="card-recipient-upload">
      <CardHeader>
        <CardTitle>Import Recipients</CardTitle>
        <CardDescription>Upload or import your recipient list from multiple sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">List Name</label>
          <Input
            placeholder="e.g., Newsletter Subscribers"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            data-testid="input-list-name"
          />
        </div>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" data-testid="tab-manual">
              <Users className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="file" data-testid="tab-file">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV/Excel
            </TabsTrigger>
            <TabsTrigger value="sheets" data-testid="tab-sheets">
              <Sheet className="h-4 w-4 mr-2" />
              Google Sheets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Enter email addresses (comma or newline separated)</label>
              <Textarea
                placeholder="email1@example.com, email2@example.com&#10;email3@example.com"
                className="min-h-32"
                value={manualEmails}
                onChange={(e) => setManualEmails(e.target.value)}
                data-testid="input-manual-emails"
              />
            </div>
            <Button onClick={handleManualValidate} data-testid="button-validate-manual">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Validate Emails
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover-elevate">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                data-testid="input-file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Supports CSV and Excel files</p>
              </label>
              {uploadedFile && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium" data-testid="text-uploaded-file">{uploadedFile.name}</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sheets" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Google Sheets URL</label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  disabled={isProcessing}
                  data-testid="input-sheets-url"
                />
              </div>
              <Button 
                onClick={handleGoogleSheets} 
                disabled={isProcessing}
                data-testid="button-import-sheets"
              >
                <Sheet className="h-4 w-4 mr-2" />
                {isProcessing ? "Importing..." : "Import from Google Sheets"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {stats && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3" data-testid="container-stats">
            <h4 className="font-semibold text-sm">Validation Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold" data-testid="text-total">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600" data-testid="text-valid">{stats.valid}</div>
                <div className="text-xs text-muted-foreground">Valid</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600" data-testid="text-invalid">{stats.invalid}</div>
                <div className="text-xs text-muted-foreground">Invalid</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600" data-testid="text-duplicates">{stats.duplicates}</div>
                <div className="text-xs text-muted-foreground">Duplicates</div>
              </div>
            </div>
            {stats.valid > 0 && (
              <Button 
                className="w-full" 
                onClick={handleSaveList}
                disabled={createListMutation.isPending}
                data-testid="button-save-list"
              >
                {createListMutation.isPending ? "Saving..." : "Save Recipient List"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
