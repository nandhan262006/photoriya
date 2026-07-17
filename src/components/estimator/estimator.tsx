"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/lib/estimator/state";
import { EstimatorProvider, useEstimator } from "@/lib/estimator/state-provider";
import type { EventTemplate } from "@/lib/estimator/types";
import { EstimatePanel } from "./estimate-panel";
import { MobileEstimateBar } from "./mobile-bar";
import { StepNav } from "./step-nav";
import { AlbumStep } from "./steps/album-step";
import { CoverageOnlyStep } from "./steps/coverage-only-step";
import { AddOnStep } from "./steps/add-on-step";
import { ReelsStep } from "./steps/reels-step";
import { DeliverablesStep } from "./steps/deliverables-step";
import { EstimateStep } from "./steps/estimate-step";
import { DownloadStep } from "./steps/download-step";
import { EventTypeStep } from "./steps/event-type-step";
import { SubEventsStep } from "./steps/sub-events-step";

export function Estimator({ templates }: { templates: EventTemplate[] }) {
  return (
    <EstimatorProvider templates={templates}>
      <EstimatorShell />
    </EstimatorProvider>
  );
}

const SKIPPABLE_STEPS = new Set([2, 3, 4, 5]);

function EstimatorShell() {
  const { state, dispatch } = useEstimator();
  const lastStep = STEPS.length - 1;

  const canProceed = (() => {
    switch (state.step) {
      case 0:
        return !!state.eventTypeId;
      case 1:
        return state.selectedSubEvents.length > 0;
      default:
        return true;
    }
  })();

  const next = () =>
    dispatch({ type: "SET_STEP", step: Math.min(lastStep, state.step + 1) });
  const prev = () =>
    dispatch({ type: "SET_STEP", step: Math.max(0, state.step - 1) });
  const skip = () =>
    dispatch({ type: "SET_STEP", step: Math.min(lastStep, state.step + 1) });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </span>
            <span>StudioBook</span>
          </Link>
          <div className="flex flex-col leading-none text-right">
            <span className="text-xs text-muted-foreground">
              Event Cost Estimator
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:gap-8">
          <div className="min-w-0">
            <StepNav />
            <div className="mt-6">
              {state.step === 0 && <EventTypeStep />}
              {state.step === 1 && <SubEventsStep />}
              {state.step === 2 && <CoverageOnlyStep />}
              {state.step === 3 && <AlbumStep />}
              {state.step === 4 && <AddOnStep />}
              {state.step === 5 && <ReelsStep />}
              {state.step === 6 && <DeliverablesStep />}
              {state.step === 7 && <EstimateStep />}
              {state.step === 8 && <DownloadStep />}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {state.step > 0 && (
                  <Button variant="outline" onClick={prev}>
                    <ArrowLeft className="mr-1.5 size-4" />
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {SKIPPABLE_STEPS.has(state.step) && state.step < lastStep && (
                  <Button variant="ghost" onClick={skip}>
                    Skip
                    <SkipForward className="ml-1.5 size-4" />
                  </Button>
                )}
                {state.step < lastStep && (
                  <Button onClick={next} disabled={!canProceed}>
                    Next
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border bg-card p-4">
              <EstimatePanel />
            </div>
          </aside>
        </div>
      </main>

      <MobileEstimateBar />
    </div>
  );
}
