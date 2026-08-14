"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WizardSteps } from "@/components/submit/WizardSteps";
import { UploadDataStep } from "@/components/submit/UploadDataStep";
import { SelectMarketsStep } from "@/components/submit/SelectMarketsStep";
import { SelectLanguagesStep } from "@/components/submit/SelectLanguagesStep";
import { AiInstructionsStep } from "@/components/submit/AiInstructionsStep";
import { ReviewSubmitStep } from "@/components/submit/ReviewSubmitStep";
import { WIZARD_STEPS } from "@/lib/submit-wizard-steps";
import styles from "./page.module.css";

export default function SubmitPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [markets, setMarkets] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [aiInstructions, setAiInstructions] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function renderStep() {
    switch (WIZARD_STEPS[stepIndex].id) {
      case "upload-data":
        return <UploadDataStep />;
      case "select-markets":
        return (
          <SelectMarketsStep selected={markets} onToggle={(v) => toggle(markets, setMarkets, v)} />
        );
      case "select-languages":
        return (
          <SelectLanguagesStep
            selected={languages}
            onToggle={(v) => toggle(languages, setLanguages, v)}
          />
        );
      case "ai-instructions":
        return <AiInstructionsStep value={aiInstructions} onChange={setAiInstructions} />;
      case "review-submit":
        return (
          <ReviewSubmitStep
            markets={markets}
            languages={languages}
            aiInstructions={aiInstructions}
            submitted={submitted}
            onSubmit={() => setSubmitted(true)}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div>
      <h1 className="pageTitle">Submit</h1>
      <p className="pageSub">Complete each step to generate and submit your regulatory documents.</p>

      <WizardSteps currentIndex={stepIndex} />

      <Card className={styles.stepCard}>{renderStep()}</Card>

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
