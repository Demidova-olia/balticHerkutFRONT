export const uploadImage = async (file: File): Promise<{ url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();
  return {
    url: data.url,
    public_id: data.public_id,
  };
};