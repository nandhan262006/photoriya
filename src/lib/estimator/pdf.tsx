/**
 * Branded PDF renderer for the estimator (server-only).
 *
 * Uses @react-pdf/renderer to lay out a clean, branded estimate document.
 * The Route Handler re-runs the pricing engine on the server before calling
 * this, so the figures here are always trusted/validated.
 */
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import { formatINRPlain } from "./format";
import type {
  DeliverableGroup,
  EstimateBreakdown,
  EstimatorState,
  EventTemplate,
} from "./types";

// Load watermark image as base64
let watermarkBase64Cache: string | null | undefined;

function getWatermarkBase64(): string | null {
  if (watermarkBase64Cache !== undefined) return watermarkBase64Cache;
  try {
    const imagePath = path.join(process.cwd(), "public", "NAVIBAR.png");
    const imageBuffer = fs.readFileSync(imagePath);
    watermarkBase64Cache = `data:image/png;base64,${imageBuffer.toString("base64")}`;
    return watermarkBase64Cache;
  } catch {
    watermarkBase64Cache = null;
    return null;
  }
}

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
    color: "#15181D",
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  date: {
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#d1d5db",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#15181D",
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
    color: "#6b7280",
  },
  metaValue: {
    flex: 1,
    color: "#1a1a1a",
  },
  groupLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#9ca3af",
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
  lineDetail: { fontSize: 8, color: "#9ca3af" },
  linePrice: { textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#15181D",
    borderRadius: 6,
  },
  totalLabel: { color: "#9ca3af", fontSize: 9 },
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
  deliverableBullet: { width: 12, color: "#15181D" },
  deliverableText: { flex: 1 },
  disclaimer: {
    marginTop: 18,
    fontSize: 8,
    color: "#9ca3af",
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 14,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "25%",
    width: "50%",
    opacity: 0.08,
  },
});

interface PdfProps {
  template: EventTemplate;
  state: EstimatorState;
  estimate: EstimateBreakdown;
  deliverables: DeliverableGroup[];
}

function Watermark() {
  const watermarkBase64 = getWatermarkBase64();

  if (!watermarkBase64) return null;
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image src={watermarkBase64} style={styles.watermark} />;
}

// A4 dimensions in points
const PAGE_HEIGHT = 842;
const PAGE_PADDING = 80; // 40 top + 40 bottom
const AVAILABLE_HEIGHT = PAGE_HEIGHT - PAGE_PADDING;

// Estimated heights for layout calculation
const HEADER_HEIGHT = 40;
const DIVIDER_HEIGHT = 32;
const SECTION_TITLE_HEIGHT = 20;
const META_ROW_HEIGHT = 16;
const LINE_ITEM_HEIGHT = 20;
const TOTAL_BOX_HEIGHT = 60;
const DELIVERABLE_GROUP_HEIGHT = 18;
const DELIVERABLE_ITEM_HEIGHT = 15;
const DISCLAIMER_HEIGHT = 40;
const FOOTER_HEIGHT = 30;

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

  const allLineItems = grouped.flatMap((g) =>
    g.items.map((item) => ({ ...item, group: g.group }))
  );

  // Calculate fixed overhead (everything except line items and deliverables)
  const fixedHeight =
    HEADER_HEIGHT +
    DIVIDER_HEIGHT +
    SECTION_TITLE_HEIGHT + // Event details title
    META_ROW_HEIGHT * 2 + // Event type + Sub-events
    DIVIDER_HEIGHT +
    SECTION_TITLE_HEIGHT + // Price breakdown title
    TOTAL_BOX_HEIGHT +
    DISCLAIMER_HEIGHT +
    FOOTER_HEIGHT;

  // Calculate deliverables height
  const deliverablesHeight = deliverables.reduce((acc, g) => {
    return acc + DELIVERABLE_GROUP_HEIGHT + g.items.length * DELIVERABLE_ITEM_HEIGHT;
  }, 0);

  // Available space for line items
  const availableForItems = AVAILABLE_HEIGHT - fixedHeight - (deliverables.length > 0 ? deliverablesHeight + DIVIDER_HEIGHT + SECTION_TITLE_HEIGHT : 0);

  // How many items fit on page 1
  const itemsPerPage1 = Math.floor(availableForItems / LINE_ITEM_HEIGHT);
  const needsSecondPage = allLineItems.length > itemsPerPage1;

  // Page 1 items
  const page1Items = allLineItems.slice(0, itemsPerPage1);
  // Page 2+ items
  const remainingItems = allLineItems.slice(itemsPerPage1);

  // Check if remaining items + deliverables fit on page 2
  const page2AvailableHeight = AVAILABLE_HEIGHT - SECTION_TITLE_HEIGHT - 10;
  const page2ItemsHeight = remainingItems.length * LINE_ITEM_HEIGHT;
  const page2NeedsThirdPage = page2ItemsHeight + deliverablesHeight + DIVIDER_HEIGHT + SECTION_TITLE_HEIGHT + DISCLAIMER_HEIGHT + FOOTER_HEIGHT > page2AvailableHeight;

  // Split remaining items if needed
  const page2Items = page2NeedsThirdPage
    ? remainingItems.slice(0, Math.floor((page2AvailableHeight - DIVIDER_HEIGHT - SECTION_TITLE_HEIGHT - DISCLAIMER_HEIGHT - FOOTER_HEIGHT) / LINE_ITEM_HEIGHT))
    : remainingItems;
  const page3Items = page2NeedsThirdPage ? remainingItems.slice(page2Items.length) : [];

  return (
    <Document>
      {/* Page 1: Header + Event Details + Price Breakdown (part 1) */}
      <Page size="A4" style={styles.page}>
        <Watermark />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={styles.brand}>Photriya Studios</Text>
            <Text style={styles.subtitle}>Event Cost Estimate</Text>
          </View>
          <Text style={styles.date}>{today}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Client details</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Name</Text>
          <Text style={styles.metaValue}>{state.clientName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Phone</Text>
          <Text style={styles.metaValue}>{state.clientPhone}</Text>
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
        {page1Items.map((item) => (
          <View key={item.id} style={styles.lineItem}>
            <View style={styles.lineLabel}>
              <Text>{item.label}</Text>
              {item.detail ? (
                <Text style={styles.lineDetail}>{item.detail}</Text>
              ) : null}
            </View>
            <Text style={styles.linePrice}>
              {formatINRPlain(item.value)}
            </Text>
          </View>
        ))}

        {/* If everything fits, show total + deliverables on page 1 */}
        {!needsSecondPage && (
          <>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>ESTIMATED TOTAL (APPROXIMATE)</Text>
              <Text style={styles.totalValue}>
                {estimate.isEmpty
                  ? formatINRPlain(0)
                  : formatINRPlain(estimate.total)}
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
          </>
        )}
      </Page>

      {/* Page 2: Remaining items + Total + Deliverables */}
      {needsSecondPage && (
        <Page size="A4" style={styles.page}>
          <Watermark />
          <Text style={styles.sectionTitle}>Price breakdown (continued)</Text>
          {page2Items.map((item) => (
            <View key={item.id} style={styles.lineItem}>
              <View style={styles.lineLabel}>
                <Text>{item.label}</Text>
                {item.detail ? (
                  <Text style={styles.lineDetail}>{item.detail}</Text>
                ) : null}
              </View>
              <Text style={styles.linePrice}>
                {formatINRPlain(item.value)}
              </Text>
            </View>
          ))}

          {/* If no page 3 needed, show total + deliverables on page 2 */}
          {!page2NeedsThirdPage && (
            <>
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>ESTIMATED TOTAL (APPROXIMATE)</Text>
                <Text style={styles.totalValue}>
                  {estimate.isEmpty
                    ? formatINRPlain(0)
                    : formatINRPlain(estimate.total)}
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
            </>
          )}
        </Page>
      )}

      {/* Page 3: Final remaining items + Total + Deliverables */}
      {page2NeedsThirdPage && (
        <Page size="A4" style={styles.page}>
          <Watermark />
          <Text style={styles.sectionTitle}>Price breakdown (continued)</Text>
          {page3Items.map((item) => (
            <View key={item.id} style={styles.lineItem}>
              <View style={styles.lineLabel}>
                <Text>{item.label}</Text>
                {item.detail ? (
                  <Text style={styles.lineDetail}>{item.detail}</Text>
                ) : null}
              </View>
              <Text style={styles.linePrice}>
                {formatINRPlain(item.value)}
              </Text>
            </View>
          ))}

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>ESTIMATED TOTAL (APPROXIMATE)</Text>
            <Text style={styles.totalValue}>
              {estimate.isEmpty
                ? formatINRPlain(0)
                : formatINRPlain(estimate.total)}
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
      )}
    </Document>
  );
}

export async function renderEstimatePdf(props: PdfProps): Promise<Buffer> {
  return renderToBuffer(<EstimatePdfDocument {...props} />);
}
