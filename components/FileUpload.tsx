"use client";
import React, { useRef, useState } from "react";
import config from "@/lib/config";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  UploadResponse,
  upload,
  Image,
  Video,
} from "@imagekit/next";
import { cn } from "@/lib/utils";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

interface Props {
  type: "image" | "video";
  accept: string;
  placeholder: string;
  folder: string;
  variant: "dark" | "light";
  onFileChange: (fileUrl: string) => void;
  value?: string;
}

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/imagekit`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;

    return { token, expire, signature };
  } catch (error: any) {
    console.error("Authentication error - imagekit", error.message);
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

const FileUpload = ({
  type,
  accept,
  placeholder,
  folder,
  variant,
  onFileChange,
  value,
}: Props) => {
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(value ?? null);

  const styles = {
    button:
      variant === "dark"
        ? "bg-dark-300"
        : "bg-light-600 border-gray-100 border",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  };

  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    const file = fileInput.files[0];

    // 🔐 File size validation
    if (type === "image" && file.size > 10 * 1024 * 1024) {
      toast.error("File size too large", {
        description: "Please upload a file that is less than 10MB in size",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";//clear the input field
      }
      return;
    } else if (type === "video" && file.size > 50 * 1024 * 1024) {
      toast.error("File size too large", {
        description: "Please upload a file that is less than 50MB in size",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";//clear the input field
      }
      return;
    }

    try {
      const { signature, expire, token } = await authenticator();

      const uploadRes = (await upload({
        file,
        fileName: file.name,
        publicKey,
        signature,
        token,
        expire,
        folder,
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
      })) as UploadResponse;

      if (!uploadRes.url) {
        throw new Error("Upload succeeded but no URL was returned.");
      }

      console.log("Upload response:", uploadRes);
      setFileUrl(uploadRes.url);
      onFileChange(uploadRes.url);
    } catch (error) {
      toast.error("unable to upload file")
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted:", error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("Network error:", error.message);
      } else if (error instanceof ImageKitServerError) {
        console.error("Server error:", error.message);
      } else {
        console.error("Upload error:", error);
      }
    }
  };

  return (
    <>
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
      />

      <button
        className={cn("upload-btn", styles.button)}
        onClick={(e) => {
          e.preventDefault();

          if (fileInputRef.current) {
            // @ts-ignore
            fileInputRef.current?.click();
          }
        }}
      >
        <UploadIcon width={20} height={20} />
        <p className={cn("text-base", styles.placeholder)}>{placeholder}</p>
      </button>

      {progress > 0 && progress !== 100 && (
        <div className="w-full rounded-full bg-green-200 mt-2">
          <div
            className="progress h-2 bg-green-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
          <p className="text-xs text-center mt-1">{Math.round(progress)}%</p>
        </div>
      )}

      {fileUrl &&
        (type === "image" ? (
          <Image
            urlEndpoint={urlEndpoint}
            src={fileUrl}
            alt="Uploaded preview"
            width={500}
            height={300}
            className="rounded-xl mt-4"
          />
        ) : type === "video" ? (
          <Video
            urlEndpoint={urlEndpoint}
            src={fileUrl}
            controls
            className="h-96 w-full rounded-xl mt-4"
          />
        ) : null)}
    </>
  );
};

export default FileUpload;
