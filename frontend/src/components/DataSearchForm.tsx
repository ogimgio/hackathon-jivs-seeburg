import { Button } from "@/components/ui/button";
import { FileText, Search, Shield, Trash2 } from "lucide-react";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface DataSearchFormProps {
  onSearch: (data: {
    firstName: string;
    lastName: string;
    action: "mask" | "delete" | "log";

  }) => void;
  isLoading: boolean;
}

export const DataSearchForm = ({
  onSearch,
  isLoading,
}: DataSearchFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [action, setAction] = useState<"mask" | "delete" | "log">("mask");


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

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-emerald-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">
          Data Management Portal
        </CardTitle>
        <CardDescription className="text-slate-500">
          Search for personal data records and choose your privacy action
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">
                First Name
              </Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">
                Last Name
              </Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-900">Privacy Action</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => setAction("mask")}
                className={`h-auto p-4 text-left flex items-center gap-3 transition-colors ${action === "mask"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-slate-100 hover:bg-emerald-50 hover:border-emerald-200 text-slate-900 border border-slate-200"
                  }`}
              >
                <Shield className="w-5 h-5" />
                <div>
                  <div className="font-medium">Mask Data</div>
                  <div className="text-sm opacity-90">Anonymize personal information</div>
                </div>
              </Button>

              <Button
                type="button"
                onClick={() => setAction("delete")}
                className={`h-auto p-4 text-left flex items-center gap-3 transition-colors ${action === "delete"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-slate-100 hover:bg-red-50 hover:border-red-200 text-slate-900 border border-slate-200"
                  }`}
              >
                <Trash2 className="w-5 h-5" />
                <div>
                  <div className="font-medium">Delete Data</div>
                  <div className="text-sm opacity-90">Permanently remove records</div>
                </div>
              </Button>
              <Button
                type="button"
                onClick={() => setAction("log")}
                className={`h-auto p-4 text-left flex items-center gap-3 transition-colors ${action === "log"
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-slate-100 hover:bg-blue-50 hover:border-blue-200 text-slate-900 border border-slate-200"
                  }`}
              >
                <FileText className="w-5 h-5" />
                <div>
                  <div className="font-medium">Log Data</div>
                  <div className="text-sm opacity-90">Record data access log</div>
                </div>
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !firstName.trim() || !lastName.trim()}
            className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-500 hover:opacity-90 text-white py-3 text-lg font-medium rounded-lg shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Search className="w-5 h-5 mr-2" />
            )}
            {isLoading ? "Searching..." : "Search Records"}
          </Button>
        </form>
      </CardContent>
    </Card>

  );
};
