import { centsFromAmount, amountFromCents } from "../utils/money.js";

export type ParsedReceiptItem = {
  name: string;
  quantity: number;
  unitCents: number;
  totalCents: number;
};

export type ParsedReceipt = {
  merchant: string;
  receiptDate: Date | null;
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
  feesCents: number;
  totalCents: number;
  confidence: number;
  rawText: string;
  items: ParsedReceiptItem[];
};

const demoItems: ParsedReceiptItem[] = [
  { name: "Margherita Pizza", quantity: 1, unitCents: centsFromAmount(18.5), totalCents: centsFromAmount(18.5) },
  { name: "Caesar Salad", quantity: 1, unitCents: centsFromAmount(12), totalCents: centsFromAmount(12) },
  { name: "Pasta Primavera", quantity: 1, unitCents: centsFromAmount(16.75), totalCents: centsFromAmount(16.75) },
  { name: "Sparkling Water", quantity: 2, unitCents: centsFromAmount(4.25), totalCents: centsFromAmount(8.5) }
];

export async function parseReceiptImage(options: {
  imagePath: string;
  mimeType: string;
  providerApiKey?: string;
}): Promise<ParsedReceipt> {
  const subtotalCents = demoItems.reduce((sum, item) => sum + item.totalCents, 0);
  const taxCents = centsFromAmount(4.63);
  const tipCents = centsFromAmount(11.15);
  const feesCents = 0;
  const totalCents = subtotalCents + taxCents + tipCents + feesCents;
  const providerNote = options.providerApiKey
    ? "Provider parsing is configured but no provider adapter has been selected yet; deterministic demo fallback returned."
    : "No receipt provider configured; deterministic demo fallback returned.";

  return {
    merchant: "Demo Bistro",
    receiptDate: new Date("2026-01-05T19:30:00.000Z"),
    subtotalCents,
    taxCents,
    tipCents,
    feesCents,
    totalCents,
    confidence: options.providerApiKey ? 0.72 : 0.58,
    rawText: [
      providerNote,
      `Image: ${options.imagePath}`,
      `MIME: ${options.mimeType}`,
      ...demoItems.map((item) => `${item.name} ${amountFromCents(item.totalCents).toFixed(2)}`)
    ].join("\n"),
    items: demoItems
  };
}
