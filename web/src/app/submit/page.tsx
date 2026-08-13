"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WizardSteps } from "@/components/submit/WizardSteps";
import { ProjectDetailsStep } from "@/components/submit/ProjectDetailsStep";
import { DocumentsStep } from "@/components/submit/DocumentsStep";
import { ReviewStep } from "@/components/submit/ReviewStep";
import { ComplianceCheckStep } from "@/components/submit/ComplianceCheckStep";
import { SubmitStep } from "@/components/submit/SubmitStep";
import { WIZARD_STEPS } from "@/lib/submit-wizard-steps";
import styles from "./page.module.css";

const STEP_COMPONENTS = [ProjectDetailsStep, DocumentsStep, ReviewStep, ComplianceCheckStep];

export default function SubmitPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;
  const StepComponent = STEP_COMPONENTS[stepIndex];

  return (
    <div>
      <h1 className="pageTitle">Submit</h1>
      <p className="pageSub">Step-by-step submission wizard.</p>

      <WizardSteps currentIndex={stepIndex} />

      <Card className={styles.stepCard}>
        {isLastStep ? (
          <SubmitStep submitted={submitted} onSubmit={() => setSubmitted(true)} />
        ) : (
          <StepComponent />
        )}
      </Card>

      <div className={styles.navRow}>
        <Button
          type="button"
          variant="outline"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
        >
          Back
        </Button>
        {!isLastStep && (
          <Button
            type="button"
            onClick={() => setStepIndex((i) => Math.min(WIZARD_STEPS.length - 1, i + 1))}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
