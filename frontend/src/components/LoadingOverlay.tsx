import { Database, Search, Shield } from "lucide-react";

export const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border/50 rounded-lg p-8 shadow-elegant max-w-sm w-full mx-4">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 bg-gradient-primary rounded-full animate-pulse-glow" />
            <div className="relative w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-primary-foreground animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Searching Database</h3>
            <p className="text-sm text-muted-foreground">
              Processing your request securely...
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-primary" />
                <span>Querying records</span>
              </div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Applying privacy filters</span>
              </div>
              <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-primary" />
                <span>Preparing results</span>
              </div>
              <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
            </div>
          </div>

          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      </div>
    </div>
  );
};