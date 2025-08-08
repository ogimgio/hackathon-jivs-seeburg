import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
// Using basic table since shadcn Table not available in this environment
import { AlertTriangle, FileText, Shield, Trash2 } from "lucide-react";

interface DataRecord {
    source: string;
    name: string;
    key: string;
    probability: number;
}

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: DataRecord[];
    action: "mask" | "delete" | "log";
    isProcessing?: boolean;
}

export const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    data,
    action,
    isProcessing = false
}: ConfirmationDialogProps) => {
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

    const getActionConfig = (action: string) => {
        switch (action) {
            case "mask":
                return {
                    icon: Shield,
                    text: "mask",
                    title: "Masking",
                    color: "text-emerald-600",
                    bgColor: "bg-emerald-600 hover:bg-emerald-700",
                    description: "This will encrypt the personal data while keeping records searchable.",
                    buttonText: "Mask Data"
                };
            case "delete":
                return {
                    icon: Trash2,
                    text: "delete",
                    title: "Deletion",
                    color: "text-red-600",
                    bgColor: "bg-red-600 hover:bg-red-700",
                    description: "This action cannot be undone. The data will be permanently removed.",
                    buttonText: "Delete Data"
                };
            case "log":
                return {
                    icon: FileText,
                    text: "log",
                    title: "Logging",
                    color: "text-blue-600",
                    bgColor: "bg-blue-600 hover:bg-blue-700",
                    description: "This will record data access and create an audit trail for compliance.",
                    buttonText: "Log Data"
                };
            default:
                return {
                    icon: Shield,
                    text: "process",
                    title: "Processing",
                    color: "text-gray-600",
                    bgColor: "bg-gray-600 hover:bg-gray-700",
                    description: "This will process the selected records.",
                    buttonText: "Process Data"
                };
        }
    };

    const actionConfig = getActionConfig(action);
    const ActionIcon = actionConfig.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <ActionIcon className={`w-5 h-5 ${actionConfig.color}`} />
                        <span>Confirm Data {actionConfig.title}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {actionConfig.text} these {data.length} records?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                            {actionConfig.description}
                        </p>
                    </div>

                    <div className="border rounded-lg border-border/50 bg-background/50">
                        <div className="max-h-60 overflow-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-background/95 backdrop-blur-sm border-b">
                                    <tr className="border-border/50">
                                        <th className="font-semibold text-left p-3">Source</th>
                                        <th className="font-semibold text-left p-3">Name</th>
                                        <th className="font-semibold text-left p-3">Key</th>
                                        <th className="font-semibold text-center p-3">Probability</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((record, index) => (
                                        <tr key={index} className="border-b border-border/30">
                                            <td className="font-medium text-sm p-3">{record.source}</td>
                                            <td className="font-medium p-3">{record.name}</td>
                                            <td className="font-mono text-sm bg-muted/50 rounded px-2 py-1 m-3">
                                                {record.key}
                                            </td>
                                            <td className="text-center p-3">
                                                <Badge
                                                    variant={getProbabilityVariant(record.probability)}
                                                    className={`${getProbabilityColor(record.probability)} font-medium`}
                                                >
                                                    {record.probability}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">
                            Total Records: <span className="text-primary">{data.length}</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Action: <span className="font-medium capitalize">{actionConfig.text}</span>
                        </span>
                    </div>
                </div>

                <DialogFooter className="space-x-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={`${actionConfig.bgColor} text-white`}
                        onClick={onConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <ActionIcon className="w-4 h-4 mr-2" />
                                {actionConfig.buttonText}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};