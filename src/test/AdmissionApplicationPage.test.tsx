import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdmissionApplicationPage from "@/pages/AdmissionApplicationPage";

const { submitAdmission, toast, navigate } = vi.hoisted(() => ({
  submitAdmission: vi.fn(),
  toast: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    submitAdmission,
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("@/components/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("@/components/ui/date-picker", () => ({
  default: ({ id, value, onChange }: { id?: string; value?: string; onChange: (value: string) => void }) => (
    <input
      id={id}
      type="text"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

describe("AdmissionApplicationPage", () => {
  beforeEach(() => {
    submitAdmission.mockReset();
    toast.mockReset();
    navigate.mockReset();
  });

  it("updates the live preview and submits the application payload", async () => {
    submitAdmission.mockResolvedValue({ success: true, application_number: "ADM-2026-1001" });

    render(
      <MemoryRouter>
        <AdmissionApplicationPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Kwame" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Mensah" } });
    fireEvent.change(screen.getByLabelText("Date of Birth"), { target: { value: "2014-05-12" } });
    fireEvent.change(screen.getByLabelText("Gender"), { target: { value: "Male" } });
    fireEvent.change(screen.getByLabelText("Class Applying For"), { target: { value: "JHS 1" } });
    fireEvent.change(screen.getByLabelText("Term / Academic Year"), { target: { value: "September 2026" } });
    fireEvent.change(screen.getByLabelText("Parent / Guardian Name"), { target: { value: "Ama Mensah" } });
    fireEvent.change(screen.getByLabelText("Relationship to Student"), { target: { value: "Mother" } });
    fireEvent.change(screen.getByLabelText("Primary Phone Number"), { target: { value: "+233244445555" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "ama@example.com" } });
    fireEvent.change(screen.getByLabelText("City / Town"), { target: { value: "Accra" } });
    fireEvent.change(screen.getByLabelText("Residential Address"), { target: { value: "15 Academy Drive" } });

    expect(screen.getByText("Kwame Mensah")).toBeInTheDocument();
    expect(screen.getByText(/JHS 1/i)).toBeInTheDocument();
    expect(screen.getByText("Ama Mensah")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));

    await waitFor(() => {
      expect(submitAdmission).toHaveBeenCalledWith(expect.objectContaining({
        student_first_name: "Kwame",
        student_last_name: "Mensah",
        parent_name: "Ama Mensah",
        class_applying: "JHS 1",
      }));
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/");
    });
  });
});
