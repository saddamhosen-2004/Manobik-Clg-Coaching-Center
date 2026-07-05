export const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "";
export const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
}

export async function uploadImageToImageKit(
  file: File,
  folder: string = "general"
): Promise<string> {
  try {
    // Fallback to local server upload if ImageKit keys are not configured
    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_URL_ENDPOINT) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Local upload failed: ${errorText}`);
      }

      const result = await response.json();
      return result.url;
    }

    // 1. Get authentication parameters from Next.js server api
    const authResponse = await fetch("/api/imagekit/auth");
    if (!authResponse.ok) {
      throw new Error("Failed to get ImageKit auth parameters");
    }
    const authData: ImageKitAuthParams = await authResponse.json();

    // 2. Prepare upload form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `${Date.now()}_${file.name.replace(/\s+/g, "_")}`);
    formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
    formData.append("signature", authData.signature);
    formData.append("expire", authData.expire.toString());
    formData.append("token", authData.token);
    formData.append("folder", `/manobik-coaching/${folder}`);

    // 3. Post to ImageKit upload API
    const response = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();
    return result.url; // Returns the uploaded image URL
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw error;
  }
}
