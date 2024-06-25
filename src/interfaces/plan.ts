export interface Plan {
  name: string;
  slug: string;
  quota: number;
  pagesPerPdf: number;
  price: {
    amount: number;
    priceIds: {
      test: string;
      production: string;
    };
  };
}

export interface PlanInfo {
  plan: string;
  tagline: string;
  quota: number;
  features: {
    text: string;
    footnote?: string;
    negative?: boolean;
  }[];
}
