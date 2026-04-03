const CRIME_KEYWORDS = ["robbery", "crime", "attack", "shooting", "theft", "accident"];

const LOCATION_CANDIDATES = [
  "Westlands",
  "Kibera",
  "Thika Road",
  "CBD",
  "Kasarani",
  "Embakasi",
  "Kilimani",
  "Roysambu",
  "Ngong Road",
  "Karen",
  "Langata",
  "Parklands",
];

type CrimeType = "robbery" | "assault" | "shooting" | "theft" | "accident" | "general_crime";
type Severity = "low" | "medium" | "high";

export type ProcessedArticle = {
  title: string;
  description: string;
  locationName: string;
  crimeType: CrimeType;
  severity: Severity;
};

const detectCrimeType = (text: string): CrimeType => {
  const t = text.toLowerCase();
  if (t.includes("shoot")) return "shooting";
  if (t.includes("attack") || t.includes("assault")) return "assault";
  if (t.includes("robber")) return "robbery";
  if (t.includes("theft") || t.includes("steal")) return "theft";
  if (t.includes("accident") || t.includes("crash")) return "accident";
  return "general_crime";
};

const detectSeverity = (crimeType: CrimeType): Severity => {
  if (crimeType === "shooting" || crimeType === "assault") return "high";
  if (crimeType === "robbery" || crimeType === "theft" || crimeType === "accident") return "medium";
  return "low";
};

const detectLocation = (text: string): string => {
  const found = LOCATION_CANDIDATES.find((candidate) => text.toLowerCase().includes(candidate.toLowerCase()));
  return found ? `${found}, Nairobi` : "Nairobi CBD";
};

export const pipelineProcessorService = {
  keywords: CRIME_KEYWORDS,

  isCrimeRelated(article: { title?: string; description?: string }) {
    const text = `${article.title ?? ""} ${article.description ?? ""}`.toLowerCase();
    return CRIME_KEYWORDS.some((keyword) => text.includes(keyword));
  },

  process(article: { title?: string; description?: string }): ProcessedArticle {
    const title = article.title?.trim() || "Crime report";
    const description = article.description?.trim() || "No description";
    const text = `${title} ${description}`;
    const crimeType = detectCrimeType(text);
    const severity = detectSeverity(crimeType);
    const locationName = detectLocation(text);

    return {
      title,
      description,
      locationName,
      crimeType,
      severity,
    };
  },
};
