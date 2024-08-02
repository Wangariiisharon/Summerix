import { useState } from "react";
import { toast } from "react-hot-toast";
// import * as Sentry from '@sentry/nextjs';

export const getBase64 = (file: File, setImage: Function): void => {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    const imageString: any = reader.result;
    setImage(imageString.replace(/^data:image\/[a-z]+;base64,/, ""));
  };
  reader.onerror = function (error) {
    console.log("Error: ", error);
  };
};

interface Props {
  isDisabled: boolean;
  setImage: Function;
  title?: string;
}

export default function ImageUpload({ isDisabled, setImage, title }: Props) {
  const [imageName, setImageName] = useState("");

  const onFileUpload = (files: FileList | null) => {
    try {
      if (files && files.length) {
        if (files[0].size > 10000000) throw new Error();
        const base64 = getBase64(files[0], setImage);
        console.log("onFileUpload > base64:", base64);
        setImageName(files[0].name);
      }
    } catch (error) {
      console.error("image upload error:", error);
      toast.error("Could not upload image");
      //   Sentry.captureException(error);
      setImageName("");
      setImage("");
    }
  };

  return (
    <div className="">
      <label className="form-label">{title || "Photo"}</label>
      <div className="mt-2 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-medium text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
            >
              <span className="p-2">Upload a file</span>
              <input
                type="file"
                name="file-upload"
                id="file-upload"
                accept="image/*"
                onChange={(e) => onFileUpload(e?.target?.files)}
                disabled={isDisabled}
                className="sr-only"
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF (up to 10MB)</p>
          <p className="font-bold mt-2">{imageName}</p>
        </div>
      </div>
    </div>
  );
}
