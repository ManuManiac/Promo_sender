import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, Save, Send } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CampaignData {
  fromName: string;
  fromEmail: string;
  replyTo: string;
  subject: string;
  previewText: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export default function CampaignBuilder() {
  const [formData, setFormData] = useState<CampaignData>({
    fromName: "",
    fromEmail: "",
    replyTo: "",
    subject: "",
    previewText: "",
    utmSource: "",
    utmMedium: "email",
    utmCampaign: ""
  });
  const [utmOpen, setUtmOpen] = useState(false);

  const handleChange = (field: keyof CampaignData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    console.log('Saving draft', formData);
  };

  const handlePreview = () => {
    console.log('Opening preview', formData);
  };

  return (
    <Card data-testid="card-campaign-builder">
      <CardHeader>
        <CardTitle>Campaign Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Sender Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              placeholder="Your Company"
              value={formData.fromName}
              onChange={(e) => handleChange('fromName', e.target.value)}
              data-testid="input-from-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromEmail">From Email</Label>
            <Input
              id="fromEmail"
              type="email"
              placeholder="hello@company.com"
              value={formData.fromEmail}
              onChange={(e) => handleChange('fromEmail', e.target.value)}
              data-testid="input-from-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="replyTo">Reply-To Email</Label>
            <Input
              id="replyTo"
              type="email"
              placeholder="support@company.com"
              value={formData.replyTo}
              onChange={(e) => handleChange('replyTo', e.target.value)}
              data-testid="input-reply-to"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Email Content</h3>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="Your amazing subject line"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              data-testid="input-subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previewText">Preview Text</Label>
            <Textarea
              id="previewText"
              placeholder="This text appears in the email preview"
              className="resize-none"
              rows={2}
              value={formData.previewText}
              onChange={(e) => handleChange('previewText', e.target.value)}
              data-testid="input-preview-text"
            />
          </div>
        </div>

        <Separator />

        <Collapsible open={utmOpen} onOpenChange={setUtmOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full hover-elevate p-2 rounded-md" data-testid="button-toggle-utm">
            <h3 className="font-semibold text-sm">UTM Parameters</h3>
            {utmOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="utmSource">UTM Source</Label>
              <Input
                id="utmSource"
                placeholder="newsletter"
                value={formData.utmSource}
                onChange={(e) => handleChange('utmSource', e.target.value)}
                data-testid="input-utm-source"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utmMedium">UTM Medium</Label>
              <Input
                id="utmMedium"
                placeholder="email"
                value={formData.utmMedium}
                onChange={(e) => handleChange('utmMedium', e.target.value)}
                data-testid="input-utm-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utmCampaign">UTM Campaign</Label>
              <Input
                id="utmCampaign"
                placeholder="product-launch-2025"
                value={formData.utmCampaign}
                onChange={(e) => handleChange('utmCampaign', e.target.value)}
                data-testid="input-utm-campaign"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSaveDraft} variant="outline" className="flex-1" data-testid="button-save-draft">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePreview} className="flex-1" data-testid="button-preview">
            <Send className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
