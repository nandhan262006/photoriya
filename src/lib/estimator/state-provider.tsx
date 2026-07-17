"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type {
  ActiveRecommendation,
  DeliverableGroup,
  EstimateBreakdown,
  EventTemplate,
  EstimatorState,
} from "./types";
import { calculateEstimate } from "./pricing";
import { generateDeliverables } from "./deliverables";
import { evaluateRecommendations } from "./recommendations";
import {
  estimatorReducer,
  initialState,
  type EstimatorAction,
} from "./state";

const STORAGE_KEY = "photriya-estimator-state-v1";

const EMPTY_ESTIMATE: EstimateBreakdown = {
  items: [],
  subtotal: { min: 0, max: 0 },
  total: { min: 0, max: 0 },
  subEventCount: 0,
  isEmpty: true,
};

interface EstimatorContextValue {
  state: EstimatorState;
  dispatch: React.Dispatch<EstimatorAction>;
  templates: EventTemplate[];
  template: EventTemplate | null;
  estimate: EstimateBreakdown;
  deliverables: DeliverableGroup[];
  recommendations: ActiveRecommendation[];
}

const EstimatorContext = createContext<EstimatorContextValue | null>(null);

export function EstimatorProvider({
  templates,
  children,
}: {
  templates: EventTemplate[];
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(estimatorReducer, initialState);
  // A ref gates persistence so we don't clobber saved state before
  // rehydration. Using a ref (not state) avoids setState-in-effect.
  const hydratedRef = useRef(false);
  // Skips the very first persist run (state is still initialState).
  const persistReadyRef = useRef(false);

  // Rehydrate after mount to avoid SSR/CSR hydration mismatches.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({
          type: "HYDRATE",
          state: { ...initialState, ...JSON.parse(raw) } as EstimatorState,
        });
      }
    } catch {
      /* ignore corrupt persisted state */
    }
    hydratedRef.current = true;
  }, []);

  // Persist on change (only after initial rehydration and not on the
  // very first render where state may still be the server initialState).
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (!persistReadyRef.current) {
      persistReadyRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const template = useMemo(
    () => templates.find((t) => t.id === state.eventTypeId) ?? null,
    [templates, state.eventTypeId],
  );

  const estimate = useMemo(
    () => (template ? calculateEstimate(state, template) : EMPTY_ESTIMATE),
    [state, template],
  );

  const deliverables = useMemo(
    () => (template ? generateDeliverables(state, template) : []),
    [state, template],
  );

  const recommendations = useMemo(
    () => (template ? evaluateRecommendations(state, template) : []),
    [state, template],
  );

  const value = useMemo<EstimatorContextValue>(
    () => ({
      state,
      dispatch,
      templates,
      template,
      estimate,
      deliverables,
      recommendations,
    }),
    [state, dispatch, templates, template, estimate, deliverables, recommendations],
  );

  return (
    <EstimatorContext.Provider value={value}>
      {children}
    </EstimatorContext.Provider>
  );
}

export function useEstimator(): EstimatorContextValue {
  const ctx = useContext(EstimatorContext);
  if (!ctx) {
    throw new Error("useEstimator must be used within an EstimatorProvider");
  }
  return ctx;
}
