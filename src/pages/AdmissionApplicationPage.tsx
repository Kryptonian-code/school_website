import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, PhoneCall, UserRound } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const initialForm = {
  student_first_name: "",
  student_last_name: "",
  date_of_birth: "",
  gender: "",
  class_applying: "",
  term_applying: "",
  previous_school: "",
  parent_name: "",
  parent_relationship: "",
  parent_phone: "",
  alternate_phone: "",
  email: "",
  address: "",
  city: "",
  medical_information: "",
  notes: "",
};

const AdmissionApplicationPage = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.submitAdmission(form);

      toast({
        title: "Application submitted",
        description: `Your reference number is ${response.application_number}.`,
      });
      setForm(initialForm);
      navigate("/");
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="gradient-navy text-primary-foreground py-16 md:py-24 xl:py-28">
        <div className="section-container">
          <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Online Admission Form</p>
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-heading font-extrabold mb-4">Apply for Admission</h1>
          <p className="text-lg xl:text-xl text-primary-foreground/70 max-w-3xl">
            Complete the application below and our admissions team will contact you with the next steps.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.75fr)] items-start">
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[1.75rem] p-6 md:p-8 xl:p-10 shadow-sm space-y-8">
              <div>
                <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-5">Student Information</h2>
                <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label htmlFor="student_first_name" className="text-sm font-medium mb-1.5 block">First Name</label>
                    <Input id="student_first_name" name="student_first_name" value={form.student_first_name} onChange={handleChange} required className="h-11" />
                  </div>
                  <div>
                    <label htmlFor="student_last_name" className="text-sm font-medium mb-1.5 block">Last Name</label>
                    <Input id="student_last_name" name="student_last_name" value={form.student_last_name} onChange={handleChange} required className="h-11" />
                  </div>
                  <div>
                    <label htmlFor="date_of_birth" className="text-sm font-medium mb-1.5 block">Date of Birth</label>
                    <DatePicker
                      id="date_of_birth"
                      value={form.date_of_birth}
                      onChange={(value) => setForm((current) => ({ ...current, date_of_birth: value }))}
                      placeholder="Select date of birth"
                      fromYear={1990}
                      toYear={new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="text-sm font-medium mb-1.5 block">Gender</label>
                    <select id="gender" name="gender" value={form.gender} onChange={handleChange} required className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="class_applying" className="text-sm font-medium mb-1.5 block">Class Applying For</label>
                    <Input id="class_applying" name="class_applying" value={form.class_applying} onChange={handleChange} placeholder="e.g. JHS 1" required className="h-11" />
                  </div>
                  <div>
                    <label htmlFor="term_applying" className="text-sm font-medium mb-1.5 block">Term / Academic Year</label>
                    <Input id="term_applying" name="term_applying" value={form.term_applying} onChange={handleChange} placeholder="e.g. September 2026 intake" required className="h-11" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="previous_school" className="text-sm font-medium mb-1.5 block">Previous School</label>
                    <Input id="previous_school" name="previous_school" value={form.previous_school} onChange={handleChange} placeholder="Optional" className="h-11" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-5">Parent / Guardian Information</h2>
                <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label htmlFor="parent_name" className="text-sm font-medium mb-1.5 block">Parent / Guardian Name</label>
                    <Input id="parent_name" name="parent_name" value={form.parent_name} onChange={handleChange} required className="h-11" />
                  </div>
                  <div>
                    <label htmlFor="parent_relationship" className="text-sm font-medium mb-1.5 block">Relationship to Student</label>
                    <Input id="parent_relationship" name="parent_relationship" value={form.parent_relationship} onChange={handleChange} required className="h-11" />
                  </div>
                  <div>
                    <label htmlFor="parent_phone" className="text-sm font-medium mb-1.5 block">Primary Phone Number</label>
                    <Input id="parent_phone" name="parent_phone" value={form.parent_phone} onChange={handleChange} required className="h-11" />
                  </div>
                  <div>
                    <label htmlFor="alternate_phone" className="text-sm font-medium mb-1.5 block">Alternate Phone Number</label>
                    <Input id="alternate_phone" name="alternate_phone" value={form.alternate_phone} onChange={handleChange} className="h-11" />
                  </div>
                  <div>
                    <label htmlFor="admission_email" className="text-sm font-medium mb-1.5 block">Email Address</label>
                    <Input id="admission_email" name="email" value={form.email} onChange={handleChange} type="email" required className="h-11" />
                  </div>
                  <div>
                    <label htmlFor="city" className="text-sm font-medium mb-1.5 block">City / Town</label>
                    <Input id="city" name="city" value={form.city} onChange={handleChange} required className="h-11" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="text-sm font-medium mb-1.5 block">Residential Address</label>
                    <Input id="address" name="address" value={form.address} onChange={handleChange} required className="h-11" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-5">Additional Information</h2>
                <div className="grid gap-4 md:gap-5">
                  <div>
                    <label htmlFor="medical_information" className="text-sm font-medium mb-1.5 block">Medical Information</label>
                    <Textarea id="medical_information" name="medical_information" value={form.medical_information} onChange={handleChange} rows={4} placeholder="Allergies, special needs, or important medical notes" />
                  </div>
                  <div>
                    <label htmlFor="notes" className="text-sm font-medium mb-1.5 block">Additional Notes</label>
                    <Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={5} placeholder="Anything else you would like the admissions team to know" />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base">
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>

            <aside className="xl:sticky xl:top-32 space-y-5">
              <div className="bg-card border border-border rounded-[1.75rem] p-6 md:p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary uppercase tracking-widest">Live Preview</p>
                    <h3 className="font-heading text-xl font-bold text-foreground">Application Summary</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  This helps families confirm the key details being entered before submitting. It is advisable here because it improves confidence without duplicating the full form.
                </p>

                <div className="space-y-5">
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <UserRound className="h-4 w-4 text-primary" />
                      Student
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      {`${form.student_first_name} ${form.student_last_name}`.trim() || "Student name will appear here"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.class_applying || "Class not selected"} {form.term_applying ? `• ${form.term_applying}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.gender || "Gender not selected"} {form.date_of_birth ? `• Born ${form.date_of_birth}` : ""}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-muted/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <PhoneCall className="h-4 w-4 text-primary" />
                      Parent / Guardian
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      {form.parent_name || "Parent or guardian name will appear here"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.parent_relationship || "Relationship not entered yet"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.parent_phone || "Primary phone pending"} {form.email ? `• ${form.email}` : ""}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-dashed border-border p-4">
                    <p className="text-sm font-semibold text-foreground mb-3">Before you submit</p>
                    <div className="space-y-2">
                      {[
                        { done: Boolean(form.student_first_name && form.student_last_name), label: "Student identity completed" },
                        { done: Boolean(form.class_applying && form.term_applying), label: "Class and intake selected" },
                        { done: Boolean(form.parent_name && form.parent_phone), label: "Parent contact completed" },
                        { done: Boolean(form.address && form.city && form.email), label: "Address and email provided" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`h-4 w-4 ${item.done ? "text-green-600" : "text-muted-foreground"}`} />
                          <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdmissionApplicationPage;
