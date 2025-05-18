
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAssetSchema } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, parseFormattedCurrency } from "@/lib/utils";

interface BulkAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sources: string[];
}

const formSchema = z.object({
  month: z.date(),
  assets: z.array(z.object({
    source: z.string(),
    amount: z.string(),
  }))
});

export default function BulkAssetForm({
  isOpen,
  onClose,
  onSuccess,
  sources,
}: BulkAssetFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: new Date(),
      assets: sources.map(source => ({
        source,
        amount: "",
      }))
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Filter out assets with empty amounts
      const assetsToAdd = data.assets
        .filter(asset => asset.amount !== "")
        .map(asset => ({
          source: asset.source,
          amount: parseFormattedCurrency(asset.amount),
          month: data.month.toISOString(),
        }));

      if (assetsToAdd.length === 0) {
        toast({
          title: "No assets to add",
          description: "Please enter at least one asset amount",
          variant: "destructive",
        });
        return;
      }

      // Add all assets
      await Promise.all(
        assetsToAdd.map(asset =>
          apiRequest("/api/assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(asset)
          })
        )
      );

      toast({
        title: "Assets added",
        description: `Successfully added ${assetsToAdd.length} assets`,
      });
      
      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save assets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (index: number, value: string) => {
    // Remove non-numeric characters
    let numericValue = value.replace(/\D/g, "");
    
    // Format with thousand separators if there's a value
    if (numericValue) {
      const numValue = parseInt(numericValue, 10);
      numericValue = formatCurrency(numValue);
    }
    
    const assets = form.getValues("assets");
    assets[index].amount = numericValue;
    form.setValue("assets", assets);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk Add Assets</DialogTitle>
          <DialogDescription>
            Add multiple assets for a specific month
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Month</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          const popover = document.querySelector('[data-state="open"]');
                          if (popover) {
                            const closeButton = popover.querySelector('button[aria-label="Close"]');
                            if (closeButton) {
                              closeButton.click();
                            }
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sources.map((source, index) => (
                <div key={source} className="flex items-center gap-4">
                  <div className="flex-1">
                    <FormLabel>{source}</FormLabel>
                    <FormField
                      control={form.control}
                      name={`assets.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="0"
                                {...field}
                                onChange={(e) => handleAmountChange(index, e.target.value)}
                              />
                              <span className="absolute right-3 top-2.5 text-gray-500">₫</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="flex space-x-2 mt-6">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Assets"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
