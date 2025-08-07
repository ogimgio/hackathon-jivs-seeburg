import { useState } from "react";
import { DataSearchForm } from "@/components/DataSearchForm";
import { DataTable } from "@/components/DataTable";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useToast } from "@/hooks/use-toast";

interface DataRecord {
  firstName: string;
  lastName: string;
  key: string;
  encryptionKey: string;
  probability: number;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<DataRecord[]>([]);
  const [lastAction, setLastAction] = useState<"mask" | "delete">("mask");
  const { toast } = useToast();

  const handleSearch = async (searchData: {
    firstName: string;
    lastName: string;
    action: "mask" | "delete";
  }) => {
    setIsLoading(true);
    setLastAction(searchData.action);

    try {
      // Simulate API call with realistic delay
      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: DataRecord[] = await response.json();
      setSearchResults(data);
      
      toast({
      title: "Search Complete",
      description: `Found ${data.length} records matching your criteria.`,
    });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "An error occurred while searching the database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-4 md:p-8">
      {isLoading && <LoadingOverlay />}
      
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Data Privacy Portal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Secure data management with advanced search capabilities and privacy controls
          </p>
        </header>

        <DataSearchForm onSearch={handleSearch} isLoading={isLoading} />

        {searchResults.length > 0 && (
          <div className="space-y-6">
            <DataTable data={searchResults} action={lastAction} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
