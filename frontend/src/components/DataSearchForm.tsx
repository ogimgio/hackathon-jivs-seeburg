import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Database } from "lucide-react";

interface DataSearchFormProps {
  onSearch: (data: {
    firstName: string;
    lastName: string;
    action: "mask" | "delete";
  }) => void;
  isLoading: boolean;
}

export const DataSearchForm = ({
  onSearch,
  isLoading,
}: DataSearchFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [action, setAction] = useState<"mask" | "delete">("mask");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      onSearch({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        action,
      });
    }
  };

  const handleActionChange = (newAction: "mask" | "delete") => {
    setAction(newAction);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elegant bg-gradient-secondary border-border/50">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-2">
          <Database className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Data Management Portal
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Search for personal data records and choose your privacy action
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="h-11 bg-background border-border/50 focus:ring-primary/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="h-11 bg-background border-border/50 focus:ring-primary/30"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Privacy Action</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mask Data Option */}
              <div
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  action === "mask"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/50 hover:border-border"
                }`}
                onClick={() => handleActionChange("mask")}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    action === "mask"
                      ? "bg-primary border-primary"
                      : "border-border"
                  }`}
                >
                  {action === "mask" && (
                    <div className="w-2 h-2 rounded bg-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium">Mask Data</div>
                  <div className="text-sm text-muted-foreground">
                    Anonymize personal information
                  </div>
                </div>
              </div>

              {/* Delete Data Option */}
              <div
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  action === "delete"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/50 hover:border-border"
                }`}
                onClick={() => handleActionChange("delete")}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    action === "delete"
                      ? "bg-primary border-primary"
                      : "border-border"
                  }`}
                >
                  {action === "delete" && (
                    <div className="w-2 h-2 rounded bg-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium">Delete Data</div>
                  <div className="text-sm text-muted-foreground">
                    Permanently remove records
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-primary hover:shadow-elegant transition-all duration-300 font-medium"
            disabled={isLoading || !firstName.trim() || !lastName.trim()}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Records
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
