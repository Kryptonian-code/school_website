import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ContactSection from "@/components/ContactSection";

const { submitEnquiry, toast } = vi.hoisted(() => ({
  submitEnquiry: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    submitEnquiry,
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/contexts/SiteContentContext", () => ({
  useSiteContent: () => ({
    data: { settings: {} },
  }),
}));

vi.mock("@/components/ScrollReveal", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

describe("ContactSection", () => {
  beforeEach(() => {
    submitEnquiry.mockReset();
    toast.mockReset();
  });

  it("submits the contact form to the enquiry API", async () => {
    submitEnquiry.mockResolvedValue({ success: true });

    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Kwame Mensah" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "kwame@example.com" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "+233244445555" } });
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Admissions enquiry" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I would like to know more about admissions." } });

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(submitEnquiry).toHaveBeenCalledWith({
        name: "Kwame Mensah",
        email: "kwame@example.com",
        phone: "+233244445555",
        subject: "Admissions enquiry",
        message: "I would like to know more about admissions.",
        type: "contact",
      });
    });
  });
});
