type UploadDataImage = {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
};

type UploadDataThumb = {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
};

type UploadDataMedium = {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
};

export type UploadData = {
  id: string;
  title: string;
  url_viewer: string;
  url: string;
  display_url: string;
  width: string;
  height: string;
  size: string;
  time: string;
  expiration: string;
  image: UploadDataImage;
  thumb: UploadDataThumb;
  medium: UploadDataMedium;
};

export type ImageUploadResponse = {
  data: UploadData;
  success: boolean;
  status: number;
};
