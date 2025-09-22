import axiosInstance from "../utils/axios";
import type { AboutContent } from "../types/about";
import { getCurrentLang } from "../types/i18n";

export async function getAbout(): Promise<AboutContent> {
  const lang = getCurrentLang();
  const res = await axiosInstance.get<{ message: string; data: AboutContent }>(
    "/about",
    { headers: { "Accept-Language": lang } }
  );
  return res.data.data;
}

type AboutFiles = {
  heroImage?: File | null;
  storeImage?: File | null;
  requisitesImage?: File | null;
};

export async function saveAbout(
  payload: AboutContent,
  files?: AboutFiles
): Promise<AboutContent> {
  const lang = getCurrentLang();
  const hasFiles = Boolean(files?.heroImage || files?.storeImage || files?.requisitesImage);

  if (!hasFiles) {
    const res = await axiosInstance.put<{ message: string; data: AboutContent }>(
      "/about",
      payload,
      { headers: { "Accept-Language": lang }, dedupe: false }
    );
    return res.data.data;
  }

  const fd = new FormData();
  fd.append("payload", JSON.stringify(payload));
  if (files?.heroImage instanceof File)       fd.append("heroImage", files.heroImage);
  if (files?.storeImage instanceof File)      fd.append("storeImage", files.storeImage);
  if (files?.requisitesImage instanceof File) fd.append("requisitesImage", files.requisitesImage);

  const res = await axiosInstance.put<{ message: string; data: AboutContent }>(
    "/about",
    fd,
    { headers: { "Accept-Language": lang }, dedupe: false }
  );
  return res.data.data;
}
