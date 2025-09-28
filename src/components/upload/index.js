import { isEmpty, isNull } from "lodash";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const AddPhoto = ({ profile, setProfile }) => {
  const [error, setError] = useState("");

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      console.log(acceptedFiles, "get accepted files");
      setProfile(acceptedFiles[0]);
    },
    [setProfile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB limit
    multiple: false,
  });

  return (
    <div className="flex flex-col justify-center items-center">
      {error && (
        <div className="mb-2 text-red-500 text-sm text-center">{error}</div>
      )}
      <div
        {...getRootProps()}
        className={`
          w-32 h-32 rounded-full 
          flex flex-col items-center justify-center 
          border-2 border-dashed 
          cursor-pointer
          transition-all duration-200 ease-in-out
          relative
          overflow-hidden
          ${
            isDragActive
              ? "border-blue-400 bg-blue-50 text-blue-600"
              : "border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400 hover:bg-gray-100"
          }
        `}
      >
        <input {...getInputProps()} />

        {!isNull(profile) ? (
          // Image preview that fills the entire circle
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <Image
              src={URL.createObjectURL(profile)}
              fill
              className="object-cover"
              alt="profile preview"
            />
            {/* Overlay for drag state */}
            {isDragActive && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <div className="text-center">
            {isDragActive ? (
              <div className="flex flex-col items-center">
                <svg
                  className="w-6 h-6 mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-xs font-medium">Drop here</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  className="w-6 h-6 mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-xs font-medium text-center">Add Photo</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPhoto;
