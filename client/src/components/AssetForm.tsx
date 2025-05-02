import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Asset, insertAssetSchema } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { formatCurrency, parseFormattedCurrency } from "@/lib/utils";

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAsset?: Asset;
  sources?: string[];
}

const formSchema = insertAssetSchema.extend({
  source: z.string().min(1, "Source is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  otherSource: z.string().optional(),
});

export default function AssetForm({
  isOpen,
  onClose,
  onSuccess,
  editAsset,
  sources: providedSources,
}: AssetFormProps) {
  const { toast } = useToast();
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use provided sources or fetch them if not available
  useEffect(() => {
    if (providedSources && providedSources.length > 0) {
      // Use the provided sources directly
      setAvailableSources(providedSources);
      setIsLoading(false);
    } else {
      // Fetch available sources from the API
      const fetchSources = async () => {
        setIsLoading(true);
        try {
          const sources = await apiRequest<string[]>("/api/sources");
          setAvailableSources(sources);
        } catch (error) {
          console.error("Failed to fetch sources:", error);
          toast({
            title: "Error",
            description: "Failed to fetch available sources",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchSources();
    }
  }, [toast, providedSources]);
  
  const defaultValues = editAsset
    ? {
        source: editAsset.source,
        amount: formatCurrency(editAsset.amount),
        description: editAsset.description || "",
        otherSource: "",
      }
    : {
        source: "",
        amount: "",
        description: "",
        otherSource: "",
      };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const finalSource = data.source === "Other" ? data.otherSource : data.source;
      
      // Parse the amount from formatted string to number
      const amountValue = typeof data.amount === "string" 
        ? parseFormattedCurrency(data.amount) 
        : data.amount;

      const assetData = {
        source: finalSource,
        amount: amountValue,
        description: data.description,
      };

      if (editAsset) {
        await apiRequest(`/api/assets/${editAsset.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assetData)
        });
        toast({
          title: "Asset updated",
          description: "Your asset has been updated successfully",
        });
      } else {
        await apiRequest("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assetData)
        });
        toast({
          title: "Asset added",
          description: "Your asset has been added successfully",
        });
      }
      
      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save asset",
        variant: "destructive",
      });
    }
  };

  const handleSourceChange = (value: string) => {
    setShowOtherInput(value === "Other");
    form.setValue("source", value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    let value = e.target.value.replace(/\D/g, "");
    
    // Format with thousand separators if there's a value
    if (value) {
      const numValue = parseInt(value, 10);
      value = formatCurrency(numValue);
    }
    
    form.setValue("amount", value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editAsset ? "Edit Asset" : "Add New Asset"}
          </DialogTitle>
          <DialogDescription>
            {editAsset 
              ? "Update your asset information" 
              : "Enter details about your new asset"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select 
                    onValueChange={handleSourceChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-64 overflow-auto">
                      {isLoading ? (
                        <div className="p-2 text-center text-gray-500">Loading sources...</div>
                      ) : (
                        <>
                          {availableSources
                            .filter(source => source !== "Other") // Filter out "Other" from sources
                            .map((source) => (
                              <SelectItem key={source} value={source}>
                                {source}
                              </SelectItem>
                            ))}
                          {/* Always add "Other" option at the end */}
                          <SelectItem key="other-option" value="Other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showOtherInput && (
              <FormField
                control={form.control}
                name="otherSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Source</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter source name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (VND)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="0" 
                        {...field} 
                        onChange={handleAmountChange} 
                      />
                      <span className="absolute right-3 top-2.5 text-gray-500">₫</span>
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500">Enter amount in Vietnamese Dong (VND)</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add details about this asset" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex space-x-2 mt-6">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                {editAsset ? "Update Asset" : "Save Asset"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
