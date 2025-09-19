// src/types/about.ts
import { LocalizedField } from "./i18n";

export type AboutContent = {
  heroImageUrl: string;
  title: LocalizedField;
  subtitle: LocalizedField;
  storeImageUrl: string;
  descriptionIntro: LocalizedField;
  descriptionMore: LocalizedField;
  address: LocalizedField;
  hours: LocalizedField;
  gmapsUrl: string;
  requisitesImageUrl: string;
  socialsHandle: LocalizedField;
  reasonsTitle?: LocalizedField;
  requisitesTitle?: LocalizedField;

  reasons?: LocalizedField[];
};

