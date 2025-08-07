import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Key, Lock } from "lucide-react";

interface DataRecord {
  firstName: string;
  lastName: string;
  key: string;
  encryptionKey: string;
  probability: number;
}

interface DataTableProps {
  data: DataRecord[];
  action: "mask" | "delete";
}

export const DataTable = ({ data, action }: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(
      (record) =>
        record.firstName.toLowerCase().includes(term) ||
        record.lastName.toLowerCase().includes(term) ||
        record.key.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const getProbabilityVariant = (probability: number) => {
    if (probability >= 0.8) return "default";
    if (probability >= 0.5) return "secondary";
    return "outline";
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return "text-green-600";
    if (probability >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="w-full shadow-elegant bg-gradient-secondary border-border/50 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Search Results</span>
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} records
              </Badge>
            </CardTitle>
            <CardDescription>
              Records ready for {action === "mask" ? "data masking" : "deletion"}
            </CardDescription>
          </div>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background border-border/50"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-lg border border-border/50 bg-background/50">
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm">
                <TableRow className="border-border/50">
                  <TableHead className="font-semibold">First Name</TableHead>
                  <TableHead className="font-semibold">Last Name</TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center space-x-1">
                      <Key className="w-4 h-4" />
                      <span>Key</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center space-x-1">
                      <Lock className="w-4 h-4" />
                      <span>Encryption Key</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-center">Probability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No records match your search." : "No records found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record, index) => (
                    <TableRow 
                      key={index} 
                      className="border-border/30 hover:bg-primary/5 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">{record.firstName}</TableCell>
                      <TableCell className="font-medium">{record.lastName}</TableCell>
                      <TableCell className="font-mono text-sm bg-muted/50 rounded px-2 py-1 max-w-32 truncate">
                        {record.key}
                      </TableCell>
                      <TableCell className="font-mono text-sm bg-muted/50 rounded px-2 py-1 max-w-32 truncate">
                        {record.encryptionKey}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={getProbabilityVariant(record.probability)}
                          className={`${getProbabilityColor(record.probability)} font-medium`}
                        >
                          {(record.probability * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {filteredData.length > 0 && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">
              ✓ Ready to {action === "mask" ? "mask" : "delete"} {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};