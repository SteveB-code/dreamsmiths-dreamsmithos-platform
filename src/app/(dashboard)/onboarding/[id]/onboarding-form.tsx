"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Upload,
  FileText,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Journey {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "invited" | "in_progress" | "completed";
  currentStep: number;
}

const STEP_LABELS = [
  "Personal Details",
  "Uploads",
  "Financial",
  "Confidentiality & NDA",
  "IP, Non-circumvent, Non-solicit",
  "Data Protection",
  "Playbook & Submit",
];

// ---------------------------------------------------------------------------
// Progress Bar
// ---------------------------------------------------------------------------

function ProgressBar({
  currentStep,
  highestStep,
  onStepClick,
}: {
  currentStep: number;
  highestStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <nav className="mb-8">
      <ol className="flex items-center gap-2">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < highestStep;
          const isCurrent = stepNum === currentStep;
          const isAccessible = stepNum <= highestStep;

          return (
            <li key={stepNum} className="flex-1">
              <button
                type="button"
                disabled={!isAccessible}
                onClick={() => isAccessible && onStepClick(stepNum)}
                className={`w-full flex flex-col items-center gap-1.5 group ${
                  isAccessible
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-40"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`text-[11px] leading-tight text-center ${
                    isCurrent
                      ? "font-semibold text-foreground"
                      : isCompleted
                        ? "text-emerald-700 font-medium"
                        : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {/* progress line */}
      <div className="mt-2 flex gap-2">
        {STEP_LABELS.map((_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < highestStep;
          const isCurrent = stepNum === currentStep;
          return (
            <div
              key={stepNum}
              className={`h-1 flex-1 rounded-full ${
                isCompleted
                  ? "bg-emerald-500"
                  : isCurrent
                    ? "bg-primary"
                    : "bg-muted"
              }`}
            />
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Personal Details
// ---------------------------------------------------------------------------

interface Step1Data {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  mobile: string;
  physicalAddress: string;
  idNumber: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
}

function Step1PersonalDetails({
  data,
  onChange,
  journey,
}: {
  data: Step1Data;
  onChange: (d: Step1Data) => void;
  journey: Journey;
}) {
  const update = (field: keyof Step1Data, value: string) =>
    onChange({ ...data, [field]: value });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={journey.firstName} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={journey.lastName} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname (optional)</Label>
            <Input
              id="nickname"
              value={data.nickname}
              onChange={(e) => update("nickname", e.target.value)}
              placeholder="How you prefer to be called"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={journey.email} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              value={data.mobile}
              onChange={(e) => update("mobile", e.target.value)}
              placeholder="+27..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              value={data.idNumber}
              onChange={(e) => update("idNumber", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="physicalAddress">Physical Address</Label>
          <Textarea
            id="physicalAddress"
            value={data.physicalAddress}
            onChange={(e) => update("physicalAddress", e.target.value)}
            rows={3}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">Next of Kin</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nextOfKinName">Name</Label>
              <Input
                id="nextOfKinName"
                value={data.nextOfKinName}
                onChange={(e) => update("nextOfKinName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextOfKinPhone">Phone</Label>
              <Input
                id="nextOfKinPhone"
                value={data.nextOfKinPhone}
                onChange={(e) => update("nextOfKinPhone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextOfKinRelationship">Relationship</Label>
              <Select
                value={data.nextOfKinRelationship || ""}
                onValueChange={(v) => update("nextOfKinRelationship", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Uploads (placeholder)
// ---------------------------------------------------------------------------

function Step2Uploads() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Uploads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Document uploads will be available soon. You can skip this step for
          now.
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              Proof of Address
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Coming soon
            </p>
          </div>
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              ID Verification Photo
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Coming soon
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Financial
// ---------------------------------------------------------------------------

interface Step3Data {
  hourlyRateCents: number;
  paymentMethod: "eft" | "upwork" | "";
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
}

function Step3Financial({
  data,
  onChange,
}: {
  data: Step3Data;
  onChange: (d: Step3Data) => void;
}) {
  const displayRate = data.hourlyRateCents ? (data.hourlyRateCents / 100).toString() : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="hourlyRate">Hourly Rate (ZAR)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R
            </span>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              className="pl-7"
              value={displayRate}
              onChange={(e) =>
                onChange({
                  ...data,
                  hourlyRateCents: Math.round(
                    parseFloat(e.target.value || "0") * 100
                  ),
                })
              }
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Payment Method</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="eft"
                checked={data.paymentMethod === "eft"}
                onChange={() => onChange({ ...data, paymentMethod: "eft" })}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm">EFT (Direct Bank Transfer)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="upwork"
                checked={data.paymentMethod === "upwork"}
                onChange={() =>
                  onChange({
                    ...data,
                    paymentMethod: "upwork",
                    bankName: "",
                    accountHolder: "",
                    accountNumber: "",
                    branchCode: "",
                  })
                }
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm">Upwork</span>
            </label>
          </div>
        </div>

        {data.paymentMethod === "eft" && (
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={data.bankName}
                onChange={(e) =>
                  onChange({ ...data, bankName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder</Label>
              <Input
                id="accountHolder"
                value={data.accountHolder}
                onChange={(e) =>
                  onChange({ ...data, accountHolder: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={data.accountNumber}
                onChange={(e) =>
                  onChange({ ...data, accountNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchCode">Branch Code</Label>
              <Input
                id="branchCode"
                value={data.branchCode}
                onChange={(e) =>
                  onChange({ ...data, branchCode: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Confidentiality & NDA
// ---------------------------------------------------------------------------

function Step4NDA({
  contractorName,
  agreed,
  onAgreeChange,
}: {
  contractorName: string;
  agreed: boolean;
  onAgreeChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-emerald-800 font-medium">
          This agreement ensures that all information shared with you during your
          work with Dreamsmiths remains confidential.
        </p>
      </div>

      {/* NDA text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Confidentiality and Non-Disclosure Agreement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto rounded-md border p-4 text-sm leading-relaxed space-y-4">
            <p>
              This Confidentiality and Non-Disclosure Agreement (&quot;Agreement&quot;) is
              entered into between <strong>DREAMSMITHS MARKETING (PROPRIETARY)
              LIMITED</strong> (Registration No. 2011/001832/07), hereinafter
              referred to as &quot;Dreamsmiths&quot;, and{" "}
              <strong>{contractorName}</strong>, hereinafter referred to as the
              &quot;Independent Contractor&quot;.
            </p>

            <div>
              <p className="font-bold">1. Introduction</p>
              <p>
                In the course of discussion and correspondence between the
                Parties, one Party intends to provide the other Party with
                relevant information pertaining to the work required to be done.
                Such information is regarded as confidential information of the
                disclosing Party and is disclosed only on the terms and
                conditions set out in this Agreement.
              </p>
            </div>

            <div>
              <p className="font-bold">2. Confidential Information</p>
              <p>
                2.1 &quot;Confidential Information&quot; shall include, without
                limitation, all information and data, in whatever form, whether
                tangible or intangible, that is disclosed by either Party to the
                other, directly or indirectly, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  Business strategies, plans, methods, practices and procedures;
                </li>
                <li>
                  Financial information, pricing, and billing arrangements;
                </li>
                <li>
                  Client and customer information, lists, and contact details;
                </li>
                <li>
                  Technical information, source code, designs, specifications,
                  and software;
                </li>
                <li>
                  Marketing strategies, research data, and trade secrets;
                </li>
                <li>
                  Employee and contractor details and remuneration;
                </li>
                <li>
                  Any other proprietary information of either Party.
                </li>
              </ul>
              <p className="mt-2">
                2.2 Confidential Information does not include information that:
                (a) is or becomes publicly available through no fault of the
                receiving Party; (b) was already known to the receiving Party
                before disclosure; (c) is independently developed by the
                receiving Party; or (d) is lawfully received from a third party
                without restriction.
              </p>
            </div>

            <div>
              <p className="font-bold">3. Non-Disclosure</p>
              <p>
                3.1 The receiving Party agrees not to disclose, publish, or
                otherwise reveal any Confidential Information to any third party
                without the prior written consent of the disclosing Party.
              </p>
              <p>
                3.2 The receiving Party shall use the Confidential Information
                solely for the purpose of performing its obligations under this
                Agreement and any related service agreement.
              </p>
              <p>
                3.3 The receiving Party shall take all reasonable measures to
                protect the secrecy of and avoid disclosure or use of
                Confidential Information, using at least the same degree of care
                as it uses to protect its own confidential information.
              </p>
            </div>

            <div>
              <p className="font-bold">4. Standard of Care</p>
              <p>
                The receiving Party shall protect the Confidential Information
                using the same standard of care that it uses to protect its own
                confidential information, but in no event less than reasonable
                care. The receiving Party shall ensure that its employees,
                agents, and subcontractors who have access to the Confidential
                Information are bound by obligations of confidentiality no less
                protective than those contained herein.
              </p>
            </div>

            <div>
              <p className="font-bold">5. Term</p>
              <p>
                This Agreement shall remain in effect for the duration of the
                business relationship between the Parties and for a period of
                five (5) years following its termination, unless the Confidential
                Information constitutes a trade secret, in which case the
                obligations shall continue for as long as the information remains
                a trade secret.
              </p>
            </div>

            <div>
              <p className="font-bold">6. Breach</p>
              <p>
                6.1 The receiving Party acknowledges that any breach of this
                Agreement may cause irreparable harm to the disclosing Party for
                which monetary damages may be inadequate.
              </p>
              <p>
                6.2 In the event of a breach, the disclosing Party shall be
                entitled to seek injunctive relief and any other remedies
                available at law or in equity, including but not limited to
                damages.
              </p>
              <p>
                6.3 The receiving Party shall be liable for any breach of this
                Agreement by its employees, agents, or subcontractors.
              </p>
            </div>

            <div>
              <p className="font-bold">7. Governing Law</p>
              <p>
                This Agreement shall be governed by and construed in accordance
                with the laws of the Republic of South Africa. The Parties
                consent to the jurisdiction of the High Court of South Africa in
                respect of any disputes arising out of or in connection with this
                Agreement.
              </p>
            </div>

            <div>
              <p className="font-bold">8. General</p>
              <p>
                8.1 This Agreement constitutes the entire agreement between the
                Parties with respect to the subject matter hereof and supersedes
                all prior agreements, understandings, and arrangements.
              </p>
              <p>
                8.2 No amendment or modification of this Agreement shall be valid
                unless made in writing and signed by both Parties.
              </p>
              <p>
                8.3 The failure of either Party to enforce any provision of this
                Agreement shall not constitute a waiver of such provision or the
                right to enforce it at a later time.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => onAgreeChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-sm">
              I have read and agree to the Confidentiality and Non-Disclosure
              Agreement
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5: IP, Non-circumvent, Non-solicit
// ---------------------------------------------------------------------------

function Step5IPNonCircumvent({
  contractorName,
  agreedIP,
  agreedNonCircumvent,
  agreedNonSolicit,
  onChangeIP,
  onChangeNonCircumvent,
  onChangeNonSolicit,
}: {
  contractorName: string;
  agreedIP: boolean;
  agreedNonCircumvent: boolean;
  agreedNonSolicit: boolean;
  onChangeIP: (v: boolean) => void;
  onChangeNonCircumvent: (v: boolean) => void;
  onChangeNonSolicit: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      {/* IP Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Intellectual Property Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              You agree that all code and deliverables you provide under this
              contract are the property of Dreamsmiths.
            </p>
          </div>

          <div className="max-h-[200px] overflow-y-auto rounded-md border p-4 text-sm leading-relaxed space-y-3">
            <p>
              {contractorName} (&quot;Independent Contractor&quot;) hereby assigns to
              DREAMSMITHS MARKETING (PROPRIETARY) LIMITED (&quot;Dreamsmiths&quot;) or
              Dreamsmiths&apos; designee, for no additional consideration, all of the
              Independent Contractor&apos;s rights, including copyrights, in all
              deliverables and other works prepared by the Independent Contractor
              under this agreement.
            </p>
            <p>
              The Independent Contractor acknowledges that all works, including
              but not limited to source code, designs, documentation, and any
              other materials created in the course of this engagement, shall be
              considered &quot;work made for hire&quot; and shall be the sole and exclusive
              property of Dreamsmiths from the moment of creation.
            </p>
            <p>
              To the extent that any such works do not qualify as work made for
              hire, the Independent Contractor hereby irrevocably assigns to
              Dreamsmiths all right, title, and interest in and to such works,
              including all intellectual property rights therein.
            </p>
            <p>
              The Independent Contractor agrees to execute any documents and take
              any actions reasonably requested by Dreamsmiths to perfect,
              protect, or enforce Dreamsmiths&apos; rights in the deliverables and
              works.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedIP}
              onChange={(e) => onChangeIP(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-sm">
              I have read and agree to the Intellectual Property Assignment
            </span>
          </label>
        </CardContent>
      </Card>

      {/* Non-circumvention */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Non-Circumvention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              You agree not to solicit work from Dreamsmiths&apos; clients on whose
              projects you have worked.
            </p>
          </div>

          <div className="max-h-[200px] overflow-y-auto rounded-md border p-4 text-sm leading-relaxed space-y-3">
            <p>
              During the lifetime of this agreement, and for a period of 12
              (twelve) months following the termination of the relationship with
              Dreamsmiths, {contractorName} (&quot;Independent Contractor&quot;) shall
              not, directly or indirectly, make known to any person, firm or
              corporation the names or addresses of any of the customers of
              Dreamsmiths or any other information pertaining to them.
            </p>
            <p>
              The Independent Contractor shall not, directly or indirectly, call
              on, solicit, take away, or attempt to call on, solicit, or take
              away any of the customers of Dreamsmiths on whom the Independent
              Contractor called or became acquainted with during the duration of
              this agreement, either for the Independent Contractor&apos;s own
              benefit or for the benefit of any other person, firm, or
              corporation.
            </p>
            <p>
              This restriction applies specifically to clients whose projects the
              Independent Contractor has been involved in, whether directly or
              indirectly, during the term of engagement with Dreamsmiths.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedNonCircumvent}
              onChange={(e) => onChangeNonCircumvent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-sm">
              I have read and agree to the Non-Circumvention clause
            </span>
          </label>
        </CardContent>
      </Card>

      {/* Non-solicitation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Non-Solicitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
            <p className="text-sm text-purple-800">
              You agree not to solicit Dreamsmiths&apos; employees.
            </p>
          </div>

          <div className="max-h-[200px] overflow-y-auto rounded-md border p-4 text-sm leading-relaxed space-y-3">
            <p>
              {contractorName} (&quot;Independent Contractor&quot;) agrees that he/she
              will not, either during the period of this Agreement, or for a
              period of one (1) year after this Agreement has terminated, solicit
              any of Dreamsmiths&apos; employees for a competing business.
            </p>
            <p>
              The Independent Contractor shall not, directly or indirectly,
              recruit, solicit, or induce any employee, contractor, or consultant
              of Dreamsmiths to leave Dreamsmiths&apos; employ or engagement, or
              assist any third party in doing so.
            </p>
            <p>
              This restriction applies to all persons employed by or engaged as
              contractors by Dreamsmiths at any time during the term of this
              Agreement, whether or not the Independent Contractor had direct
              contact with such persons during the engagement.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedNonSolicit}
              onChange={(e) => onChangeNonSolicit(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-sm">
              I have read and agree to the Non-Solicitation clause
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 6: Data Protection
// ---------------------------------------------------------------------------

function Step6DataProtection({
  contractorName,
  agreed,
  onAgreeChange,
}: {
  contractorName: string;
  agreed: boolean;
  onAgreeChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-emerald-800 font-medium">
          In this section you agree to various provisions of personal data
          protection under POPIA and GDPR.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Protection Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto rounded-md border p-4 text-sm leading-relaxed space-y-4">
            <p>
              This Data Protection Agreement (&quot;DPA&quot;) is entered into between{" "}
              <strong>DREAMSMITHS MARKETING (PROPRIETARY) LIMITED</strong>{" "}
              (Registration No. 2011/001832/07) and{" "}
              <strong>{contractorName}</strong> (&quot;Independent Contractor&quot;).
            </p>

            <div>
              <p className="font-bold">1. Definitions</p>
              <p>
                1.1 &quot;Personal Data&quot; means any information relating to an
                identified or identifiable natural person, as defined in the
                Protection of Personal Information Act 4 of 2013 (&quot;POPIA&quot;) and
                the General Data Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;).
              </p>
              <p>
                1.2 &quot;Processing&quot; means any operation or set of operations
                performed on Personal Data, whether by automated means or not,
                including collection, recording, organisation, structuring,
                storage, adaptation, alteration, retrieval, consultation, use,
                disclosure by transmission, dissemination, or otherwise making
                available, alignment or combination, restriction, erasure, or
                destruction.
              </p>
              <p>
                1.3 &quot;Data Subject&quot; means the identified or identifiable natural
                person to whom Personal Data relates.
              </p>
            </div>

            <div>
              <p className="font-bold">
                2. Independent Contractor&apos;s Obligations
              </p>
              <p>
                2.1 The Independent Contractor shall process Personal Data only
                in accordance with documented instructions from Dreamsmiths,
                unless required to do so by applicable law.
              </p>
              <p>
                2.2 The Independent Contractor shall ensure that persons
                authorised to process Personal Data have committed themselves to
                confidentiality or are under an appropriate statutory obligation
                of confidentiality.
              </p>
              <p>
                2.3 The Independent Contractor shall implement appropriate
                technical and organisational measures to ensure a level of
                security appropriate to the risk, including as appropriate: (a)
                the pseudonymisation and encryption of Personal Data; (b) the
                ability to ensure the ongoing confidentiality, integrity,
                availability, and resilience of processing systems; (c) the
                ability to restore the availability of and access to Personal
                Data in a timely manner in the event of a physical or technical
                incident.
              </p>
              <p>
                2.4 The Independent Contractor shall not engage any
                sub-processor without prior written authorisation from
                Dreamsmiths.
              </p>
            </div>

            <div>
              <p className="font-bold">3. Security</p>
              <p>
                3.1 The Independent Contractor shall implement and maintain
                appropriate security measures, including but not limited to:
                using strong passwords and multi-factor authentication; ensuring
                devices used for work are secured with encryption and up-to-date
                security software; not storing Personal Data on personal devices
                without authorisation; and reporting any security concerns
                promptly to Dreamsmiths.
              </p>
            </div>

            <div>
              <p className="font-bold">4. Personal Data Breach</p>
              <p>
                4.1 The Independent Contractor shall notify Dreamsmiths without
                undue delay (and in any event within 24 hours) upon becoming
                aware of a Personal Data breach.
              </p>
              <p>
                4.2 The notification shall include: (a) a description of the
                nature of the breach; (b) the categories and approximate number
                of Data Subjects concerned; (c) a description of the likely
                consequences; and (d) a description of the measures taken or
                proposed to be taken to address the breach.
              </p>
            </div>

            <div>
              <p className="font-bold">5. Term and Termination</p>
              <p>
                5.1 This DPA shall remain in effect for the duration of the
                Independent Contractor&apos;s engagement with Dreamsmiths.
              </p>
              <p>
                5.2 Upon termination, the Independent Contractor shall, at
                Dreamsmiths&apos; election, delete or return all Personal Data to
                Dreamsmiths and delete existing copies, unless applicable law
                requires storage of the Personal Data.
              </p>
              <p>
                5.3 The obligations of confidentiality and data protection shall
                survive the termination of this DPA.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => onAgreeChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-sm">
              I have read and agree to the Data Protection Agreement
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 7: Playbook & Submit
// ---------------------------------------------------------------------------

function Step7Playbook({
  agreed,
  onAgreeChange,
  completed,
}: {
  agreed: boolean;
  onAgreeChange: (v: boolean) => void;
  completed: boolean;
}) {
  if (completed) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Registration Complete</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you for completing your contractor onboarding. Your details
            have been saved and your agreements have been recorded.
          </p>
          <div className="mt-6">
            <Link href="/onboarding">
              <Button variant="outline">Back to Onboarding</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contractors&apos; Playbook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Dreamsmiths Contractors&apos; Playbook contains guidelines for
            working with us on projects. It covers communication protocols,
            development standards, time tracking, and general expectations.
          </p>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            The Playbook is currently being prepared. Once available, a download
            link will appear here.
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => onAgreeChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-sm">
              I agree to abide by the Dreamsmiths Contractors&apos; Playbook
              guidelines
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Onboarding Form
// ---------------------------------------------------------------------------

const emptyStep1: Step1Data = {
  firstName: "",
  lastName: "",
  nickname: "",
  email: "",
  mobile: "",
  physicalAddress: "",
  idNumber: "",
  nextOfKinName: "",
  nextOfKinPhone: "",
  nextOfKinRelationship: "",
};

const emptyStep3: Step3Data = {
  hourlyRateCents: 0,
  paymentMethod: "",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  branchCode: "",
};

export function OnboardingForm({ journeyId }: { journeyId: string }) {
  const router = useRouter();

  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [currentStep, setCurrentStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);

  // Step data
  const [step1Data, setStep1Data] = useState<Step1Data>(emptyStep1);
  const [step3Data, setStep3Data] = useState<Step3Data>(emptyStep3);
  const [ndaAgreed, setNdaAgreed] = useState(false);
  const [ipAgreed, setIpAgreed] = useState(false);
  const [nonCircumventAgreed, setNonCircumventAgreed] = useState(false);
  const [nonSolicitAgreed, setNonSolicitAgreed] = useState(false);
  const [dataProtectionAgreed, setDataProtectionAgreed] = useState(false);
  const [playbookAgreed, setPlaybookAgreed] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Load journey
  useEffect(() => {
    fetch(`/api/onboarding/${journeyId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: Journey) => {
        setJourney(data);
        const step = data.currentStep || 1;
        setCurrentStep(step);
        setHighestStep(step);
        if (data.status === "completed") {
          setCompleted(true);
          setHighestStep(8);
          setCurrentStep(7);
        }
      })
      .catch(() => setError("Onboarding journey not found"))
      .finally(() => setLoading(false));
  }, [journeyId]);

  // Load step data when step changes
  const loadStepData = useCallback(
    async (step: number) => {
      try {
        const res = await fetch(
          `/api/onboarding/${journeyId}/step?step=${step}`
        );
        if (!res.ok) return;
        const saved = await res.json();
        if (!saved || !saved.data) return;
        const d = saved.data;

        switch (step) {
          case 1:
            setStep1Data((prev) => ({ ...prev, ...d }));
            break;
          case 3:
            setStep3Data((prev) => ({ ...prev, ...d }));
            break;
          case 4:
            if (d.agreed !== undefined) setNdaAgreed(d.agreed);
            break;
          case 5:
            if (d.agreedIP !== undefined) setIpAgreed(d.agreedIP);
            if (d.agreedNonCircumvent !== undefined)
              setNonCircumventAgreed(d.agreedNonCircumvent);
            if (d.agreedNonSolicit !== undefined)
              setNonSolicitAgreed(d.agreedNonSolicit);
            break;
          case 6:
            if (d.agreed !== undefined) setDataProtectionAgreed(d.agreed);
            break;
          case 7:
            if (d.agreed !== undefined) setPlaybookAgreed(d.agreed);
            break;
        }
      } catch {
        // Step data not yet saved — that's fine
      }
    },
    [journeyId]
  );

  useEffect(() => {
    if (journey) {
      loadStepData(currentStep);
    }
  }, [currentStep, journey, loadStepData]);

  // Get current step's data payload
  const getStepPayload = (step: number) => {
    switch (step) {
      case 1:
        return step1Data;
      case 2:
        return { skipped: true };
      case 3:
        return step3Data;
      case 4:
        return { agreed: ndaAgreed };
      case 5:
        return {
          agreedIP: ipAgreed,
          agreedNonCircumvent: nonCircumventAgreed,
          agreedNonSolicit: nonSolicitAgreed,
        };
      case 6:
        return { agreed: dataProtectionAgreed };
      case 7:
        return { agreed: playbookAgreed };
      default:
        return {};
    }
  };

  // Save current step
  const saveStep = async (step: number) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/onboarding/${journeyId}/step`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, data: getStepPayload(step) }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return true;
    } catch {
      setError("Failed to save. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save and advance to next step
  const saveAndContinue = async () => {
    const saved = await saveStep(currentStep);
    if (!saved) return;

    const nextStep = currentStep + 1;

    // Update journey's current step on the server
    await fetch(`/api/onboarding/${journeyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentStep: nextStep,
        status: "in_progress",
      }),
    });

    if (nextStep > 7) {
      // Complete the journey
      await fetch(`/api/onboarding/${journeyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      setCompleted(true);
    }

    setHighestStep((prev) => Math.max(prev, nextStep));
    setCurrentStep(nextStep > 7 ? 7 : nextStep);
  };

  // Save only (stay on current step)
  const saveOnly = async () => {
    await saveStep(currentStep);
  };

  // Navigate to a completed step
  const goToStep = async (step: number) => {
    if (step === currentStep) return;
    setCurrentStep(step);
  };

  const contractorName = journey
    ? `${journey.firstName} ${journey.lastName}`
    : "";

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (error && !journey) {
    return <p className="text-destructive">{error}</p>;
  }

  if (!journey) return null;

  // Check if the current button should be disabled
  const isAdvanceDisabled = () => {
    switch (currentStep) {
      case 4:
        return !ndaAgreed;
      case 5:
        return !ipAgreed || !nonCircumventAgreed || !nonSolicitAgreed;
      case 6:
        return !dataProtectionAgreed;
      case 7:
        return !playbookAgreed;
      default:
        return false;
    }
  };

  const getButtonLabel = () => {
    if (currentStep < highestStep) {
      return "Save";
    }
    switch (currentStep) {
      case 2:
        return "Skip & Continue";
      case 4:
        return "Agree & Continue";
      case 5:
        return "Agree & Continue";
      case 6:
        return "Agree & Continue";
      case 7:
        return "Complete Registration";
      default:
        return "Save & Continue";
    }
  };

  return (
    <div className="max-w-4xl">
      <Link
        href="/onboarding"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Onboarding
      </Link>

      <div className="mb-2">
        <h2 className="text-lg font-semibold">
          {journey.firstName} {journey.lastName}
        </h2>
        <p className="text-sm text-muted-foreground">{journey.email}</p>
      </div>

      <ProgressBar
        currentStep={currentStep}
        highestStep={highestStep}
        onStepClick={goToStep}
      />

      {/* Step content */}
      <div className="mb-6">
        {currentStep === 1 && (
          <Step1PersonalDetails
            data={step1Data}
            onChange={setStep1Data}
            journey={journey}
          />
        )}
        {currentStep === 2 && <Step2Uploads />}
        {currentStep === 3 && (
          <Step3Financial data={step3Data} onChange={setStep3Data} />
        )}
        {currentStep === 4 && (
          <Step4NDA
            contractorName={contractorName}
            agreed={ndaAgreed}
            onAgreeChange={setNdaAgreed}
          />
        )}
        {currentStep === 5 && (
          <Step5IPNonCircumvent
            contractorName={contractorName}
            agreedIP={ipAgreed}
            agreedNonCircumvent={nonCircumventAgreed}
            agreedNonSolicit={nonSolicitAgreed}
            onChangeIP={setIpAgreed}
            onChangeNonCircumvent={setNonCircumventAgreed}
            onChangeNonSolicit={setNonSolicitAgreed}
          />
        )}
        {currentStep === 6 && (
          <Step6DataProtection
            contractorName={contractorName}
            agreed={dataProtectionAgreed}
            onAgreeChange={setDataProtectionAgreed}
          />
        )}
        {currentStep === 7 && (
          <Step7Playbook
            agreed={playbookAgreed}
            onAgreeChange={setPlaybookAgreed}
            completed={completed}
          />
        )}
      </div>

      {/* Action buttons */}
      {!completed && (
        <div className="flex items-center justify-between">
          <div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex gap-3">
            {currentStep < highestStep && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(highestStep)}
              >
                Continue to Step {highestStep}
              </Button>
            )}
            <Button
              onClick={
                currentStep < highestStep ? saveOnly : saveAndContinue
              }
              disabled={
                saving ||
                (currentStep >= highestStep && isAdvanceDisabled())
              }
            >
              {saving ? "Saving..." : getButtonLabel()}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
