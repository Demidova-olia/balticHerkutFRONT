import axiosInstance from '../utils/axios';

export type AboutPayload = {
  heroImageUrl?: string;
  heading?: string;
  subheading?: string;
  store?: {
    title?: string;
    description?: string;
    address?: string;
    hours?: string;
    mapUrl?: string;
    imageUrl?: string;
  };
  reasonsTitle?: string;
  reasons?: string[];
  requisitesTitle?: string;
  requisitesImageUrl?: string;
};

export const AboutService = {
  async get() {
    const res = await axiosInstance.get<{ data: AboutPayload }>('/about');
    return res.data.data;
  },

  async update(payload: AboutPayload, files?: {
    heroImage?: File | null;
    storeImage?: File | null;
    requisitesImage?: File | null;
  }) {
    const fd = new FormData();
    fd.append('payload', JSON.stringify(payload));
    if (files?.heroImage) fd.append('heroImage', files.heroImage);
    if (files?.storeImage) fd.append('storeImage', files.storeImage);
    if (files?.requisitesImage) fd.append('requisitesImage', files.requisitesImage);

    const res = await axiosInstance.put<{ data: AboutPayload }>('/about', fd);
    return res.data;
  },
};
