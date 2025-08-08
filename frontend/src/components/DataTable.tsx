import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Note: Using shadcn components as per your original code
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface DataRecord {
  source: string;
  name: string;
  key: string;
  encryptionKey?: string;
  probability: number;
  status?: string; // Add status field
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
        record.name.toLowerCase().includes(term) ||
        record.key.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const getProbabilityVariant = (probability: number) => {
    if (probability >= 80) return "default";
    if (probability >= 50) return "secondary";
    return "outline";
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-white";
    if (probability >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (record: DataRecord) => {
    if (!record.status) {
      return (
        <Badge variant="outline" className="text-gray-600">
          Pending
        </Badge>
      );
    }

    if (record.status.includes("masked") || record.status.includes("encrypted")) {
      return (
        <Badge variant="default" className="text-blue-600 bg-blue-100">
          ✓ Masked
        </Badge>
      );
    }

    if (record.status.includes("deletion") || record.status.includes("deleted")) {
      return (
        <Badge variant="destructive" className="text-red-600 bg-red-100">
          ✓ Deleted
        </Badge>
      );
    }

    if (record.status.includes("success") || record.status.includes("Success")) {
      return (
        <Badge variant="secondary" className="text-green-600 bg-green-100">
          ✓ Processed
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-red-600">
        ✗ Failed
      </Badge>
    );
  };

  return (
    <Card className="w-full shadow-elegant bg-gradient-secondary border-border/50 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Processing Results</span>
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} records
              </Badge>
            </CardTitle>
            <CardDescription>
              Records processed for {action === "mask" ? "data masking" : "deletion"}
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
                  <TableHead className="font-semibold text-center w-16">Source</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center space-x-1">
                      <span>Key (ID)</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-center">Probability</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No records match your search." : "No records found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record, index) => (
                    <TableRow
                      key={index}
                      className="border-border/30 hover:bg-primary/5 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">{record.source}</TableCell>
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell className="font-mono text-sm bg-muted/50 rounded px-2 py-1 max-w-48 truncate">
                        {record.key}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={getProbabilityVariant(record.probability)}
                          className={`${getProbabilityColor(record.probability)} font-medium`}
                        >
                          {record.probability}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record)}
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
              ✓ {action === "mask" ? "Masked" : "Deleted"} {filteredData.filter(r => r.status && !r.status.includes("Failed")).length} of {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};