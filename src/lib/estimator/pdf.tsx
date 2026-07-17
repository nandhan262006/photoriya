/**
 * Branded PDF renderer for the estimator (server-only).
 *
 * Uses @react-pdf/renderer to lay out a clean, branded estimate document.
 * The Route Handler re-runs the pricing engine on the server before calling
 * this, so the figures here are always trusted/validated.
 */
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatINR, formatRangeShort } from "./format";
import type {
  DeliverableGroup,
  EstimateBreakdown,
  EstimatorState,
  EventTemplate,
} from "./types";

const GROUP_ORDER = ["Coverage", "Add-on Services", "Reels", "Albums"];

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },
  subtitle: {
    fontSize: 10,
    color: "#666666",
    marginTop: 2,
  },
  date: {
    fontSize: 9,
    color: "#888888",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  metaLabel: {
    width: 110,
    color: "#666666",
  },
  metaValue: {
    flex: 1,
    color: "#1a1a1a",
  },
  groupLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 3,
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  lineLabel: { flex: 1, paddingRight: 12 },
  lineDetail: { fontSize: 8, color: "#888888" },
  linePrice: { textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#111111",
    borderRadius: 6,
  },
  totalLabel: { color: "#cccccc", fontSize: 9 },
  totalValue: {
    color: "#ffffff",
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  deliverable: {
    flexDirection: "row",
    marginBottom: 2,
  },
  deliverableBullet: { width: 12, color: "#111111" },
  deliverableText: { flex: 1 },
  disclaimer: {
    marginTop: 18,
    fontSize: 8,
    color: "#888888",
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 14,
    fontSize: 8,
    color: "#aaaaaa",
    textAlign: "center",
  },
});

interface PdfProps {
  template: EventTemplate;
  state: EstimatorState;
  estimate: EstimateBreakdown;
  deliverables: DeliverableGroup[];
}

function EstimatePdfDocument({ template, state, estimate, deliverables }: PdfProps) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subEventNames = state.selectedSubEvents.map(
    (id) => template.subEvents.find((s) => s.id === id)?.name ?? id,
  );

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: estimate.items.filter((i) => i.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={styles.brand}>Photriya Studios</Text>
            <Text style={styles.subtitle}>Event Cost Estimate</Text>
          </View>
          <Text style={styles.date}>{today}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Event details</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Event type</Text>
          <Text style={styles.metaValue}>{template.name}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Sub-events</Text>
          <Text style={styles.metaValue}>
            {subEventNames.length > 0
              ? subEventNames.join(", ")
              : "None selected"}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Price breakdown</Text>
        {grouped.length === 0 ? (
          <Text style={{ color: "#888888" }}>No items selected.</Text>
        ) : (
          grouped.map((g) => (
            <View key={g.group} style={{ marginBottom: 4 }}>
              <Text style={styles.groupLabel}>{g.group}</Text>
              {g.items.map((item) => (
                <View key={item.id} style={styles.lineItem}>
                  <View style={styles.lineLabel}>
                    <Text>{item.label}</Text>
                    {item.detail ? (
                      <Text style={styles.lineDetail}>{item.detail}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.linePrice}>
                    {formatRangeShort({ min: item.min, max: item.max })}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>ESTIMATED TOTAL (APPROXIMATE)</Text>
          <Text style={styles.totalValue}>
            {estimate.isEmpty
              ? formatINR(0)
              : formatRangeShort(estimate.total)}
          </Text>
        </View>

        {deliverables.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>What you&apos;ll receive</Text>
            {deliverables.map((g) => (
              <View key={g.group} style={{ marginBottom: 4 }}>
                <Text style={styles.groupLabel}>{g.group}</Text>
                {g.items.map((d) => (
                  <View key={d.id} style={styles.deliverable}>
                    <Text style={styles.deliverableBullet}>{"\u2022"}</Text>
                    <Text style={styles.deliverableText}>
                      {d.label}
                      {d.detail ? `  (${d.detail})` : ""}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        <Text style={styles.disclaimer}>
          Disclaimer: This is only an approximate estimate. The final quotation
          may vary depending on event duration, location, travel, venue
          restrictions and custom requirements. Please contact Photriya Studios
          for a detailed, finalised quote.
        </Text>

        <Text style={styles.footer}>
          Thank you for considering Photriya Studios.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderEstimatePdf(props: PdfProps): Promise<Buffer> {
  return renderToBuffer(<EstimatePdfDocument {...props} />);
}
