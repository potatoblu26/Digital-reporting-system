import { useState } from "react";
import { useNavigate } from "react-router";
import { AppShell } from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAppLanguage } from "../lib/appLanguage";
import { createReport, getCurrentUser } from "../lib/mockData";
import { toast } from "sonner";

export default function SubmitReport() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { language } = useAppLanguage();
  const t = language === "tl"
    ? {
        pageTitle: "Mag-Sumite ng Bagong Report",
        pageDescription: "Mag-report ng issue o concern sa barangay",
        details: "Detalye ng Report",
        detailsDesc: "Ilagay ang malinaw na detalye ng issue na nire-report mo",
        reportTitle: "Pamagat ng Report",
        titlePlaceholder: "Maikling paliwanag ng issue",
        category: "Category",
        selectCategory: "Pumili ng category",
        location: "Lokasyon",
        locationPlaceholder: "Tiyak na lugar o address",
        priority: "Priority Level",
        description: "Description",
        descriptionPlaceholder: "Ilagay ang mas kumpletong detalye ng issue...",
        submit: "Isumite ang Report",
        cancel: "Cancel",
        error: "Hindi naisumite ang report. Pakikumpleto ang mga kailangang field.",
        success: "Matagumpay na naisumite ang report!",
        low: "Mababa",
        medium: "Katamtaman",
        high: "Mataas",
      }
    : {
        pageTitle: "Submit New Report",
        pageDescription: "Report an issue or concern in your barangay",
        details: "Report Details",
        detailsDesc: "Provide detailed information about the issue you are reporting",
        reportTitle: "Report Title",
        titlePlaceholder: "Brief description of the issue",
        category: "Category",
        selectCategory: "Select a category",
        location: "Location",
        locationPlaceholder: "Specific location or address",
        priority: "Priority Level",
        description: "Description",
        descriptionPlaceholder: "Provide detailed information about the issue...",
        submit: "Submit Report",
        cancel: "Cancel",
        error: "Failed to submit report. Please complete all required fields.",
        success: "Report submitted successfully!",
        low: "Low",
        medium: "Medium",
        high: "High",
      };
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    priority: "medium",
  });

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const created = await createReport({
      title: formData.title,
      category: formData.category,
      description: formData.description,
      location: formData.location,
      priority: formData.priority as "low" | "medium" | "high",
    });

    if (!created) {
      toast.error(t.error);
      return;
    }

    toast.success(t.success);
    navigate("/user/my-reports");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppShell
      title={t.pageTitle}
      description={t.pageDescription}
      maxWidthClassName="max-w-3xl"
    >
      <Card className="border-white/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>{t.details}</CardTitle>
          <CardDescription>{t.detailsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t.reportTitle}</Label>
              <Input
                id="title"
                placeholder={t.titlePlaceholder}
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t.category}</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder={t.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Sanitation">Sanitation</SelectItem>
                  <SelectItem value="Public Safety">Public Safety</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t.location}</Label>
              <Input
                id="location"
                placeholder={t.locationPlaceholder}
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">{t.priority}</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t.low}</SelectItem>
                  <SelectItem value="medium">{t.medium}</SelectItem>
                  <SelectItem value="high">{t.high}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                placeholder={t.descriptionPlaceholder}
                rows={6}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="rounded-xl border-slate-200 bg-white"
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="h-11 flex-1 rounded-xl bg-primary hover:bg-primary/90">
                {t.submit}
              </Button>
              <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 bg-white" onClick={() => navigate("/user/dashboard")}>
                {t.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
