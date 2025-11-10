import { useState } from "react";
import CampaignBuilder from "@/components/CampaignBuilder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Monitor, Smartphone, Undo2, Redo2, Save } from "lucide-react";

export default function Builder() {
  const [preview, setPreview] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Email Builder</h1>
          <p className="text-muted-foreground mt-1">Design your email campaign</p>
        </div>
        <Button data-testid="button-save-template">
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CampaignBuilder />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={preview === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreview('desktop')}
                  data-testid="button-preview-desktop"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={preview === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreview('mobile')}
                  data-testid="button-preview-mobile"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" data-testid="button-undo">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" data-testid="button-redo">
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className={`bg-muted rounded-lg ${preview === 'desktop' ? 'aspect-[16/10]' : 'aspect-[9/16] max-w-sm mx-auto'} flex items-center justify-center`}>
              <div className="text-center text-muted-foreground">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Email editor canvas</p>
                <p className="text-xs mt-1">GrapesJS will be integrated here</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Mail({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
