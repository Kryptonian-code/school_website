import { useMemo, useState } from "react";
import { ImagePlus, Loader2, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AdminField } from "@/components/admin/AdminUI";

interface MediaUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  folder: string;
  accept?: string;
  helperText?: string;
  allowManualEntry?: boolean;
}

const MediaUploadField = ({
  label,
  value,
  onChange,
  folder,
  accept = "image/*",
  helperText,
  allowManualEntry = false,
}: MediaUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const isImageField = useMemo(() => accept.includes("image"), [accept]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const response = await api.uploadMedia(file, folder);
      onChange(response.url);
      toast({ title: "Upload complete", description: "Media file saved locally." });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <AdminField
      label={label}
      hint={helperText || (allowManualEntry ? "Upload a local file to the school website or provide an existing file URL." : "Upload a local file to the school website.")}
    >
      <div className="space-y-3">
        {allowManualEntry ? (
          <div className="relative">
            <ImagePlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={value} onChange={(event) => onChange(event.target.value)} className="pl-10" placeholder="Enter an existing uploaded file URL" />
          </div>
        ) : value ? (
          <div className="rounded-2xl border border-border/70 bg-muted/25 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Current uploaded file</p>
            <p className="mt-2 break-all text-sm text-foreground">{value}</p>
            {isImageField ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-border/70 bg-background/70">
                <img src={value} alt={label} className="max-h-48 w-full object-cover" />
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/35 p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{isImageField ? "Image upload" : "Local file upload"}</p>
              <p className="text-xs leading-5 text-muted-foreground">
                {isImageField ? "Choose an image file from your computer. It will be saved into your XAMPP-backed uploads folder." : "Files are saved into your XAMPP-backed uploads folder."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input type="file" accept={accept} onChange={handleFileChange} className="max-w-xs bg-background" />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
          </div>
        </div>
      </div>
    </AdminField>
  );
};

export default MediaUploadField;
