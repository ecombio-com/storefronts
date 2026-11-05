export type MediaImageData = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type MediaVideoData = {
  url: string;
  previewImage?: MediaImageData | null;
};

export type LightboxItem =
  | {type: 'image'; image: MediaImageData}
  | {type: 'video'; video: MediaVideoData};
