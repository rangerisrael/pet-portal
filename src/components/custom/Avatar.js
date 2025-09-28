import Image from "next/image";
import { useState } from "react";
import { toast } from 'react-toastify';

const CircleAvatar = ({
  src,
  alt = "Avatar",
  size = "md",
  fallback = null,
  className = "",
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizes = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-20 h-20 text-xl",
    "2xl": "w-24 h-24 text-2xl",
    "3xl": "w-32 h-32 text-3xl",
  };

  const sizeClass = sizes[size] || sizes.md;

  // Fallback component
  const renderFallback = () => {
    if (fallback) return fallback;

    // Default fallback with initials
    const initials = alt
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        className={`${sizeClass} rounded-full bg-gray-300 flex items-center justify-center font-medium text-gray-600 ${className}`}
        {...props}
      >
        {initials}
      </div>
    );
  };

  // If no src or image error, show fallback
  if (!src || imageError) {
    return renderFallback();
  }

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden relative ${className}`}
      {...props}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default CircleAvatar;

// Usage Examples:
export const AvatarExamples = () => {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">Circle Avatar Examples</h2>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Sizes</h3>
        <div className="flex items-center space-x-4">
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="John Doe"
            size="xs"
          />
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="John Doe"
            size="sm"
          />
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="John Doe"
            size="md"
          />
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="John Doe"
            size="lg"
          />
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="John Doe"
            size="xl"
          />
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="John Doe"
            size="2xl"
          />
        </div>
      </div>

      {/* With Fallback Initials */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fallback with Initials</h3>
        <div className="flex items-center space-x-4">
          <CircleAvatar src="" alt="John Doe" size="md" />
          <CircleAvatar src="" alt="Alice Smith" size="md" />
          <CircleAvatar src="" alt="Bob Wilson" size="md" />
        </div>
      </div>

      {/* Custom Fallback */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Fallback</h3>
        <CircleAvatar
          src=""
          alt="User"
          size="lg"
          fallback={
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          }
        />
      </div>

      {/* With Border */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Border & Shadow</h3>
        <div className="flex items-center space-x-4">
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="Profile"
            size="lg"
            className="border-4 border-white shadow-lg"
          />
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="Profile"
            size="lg"
            className="border-2 border-blue-500"
          />
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="Profile"
            size="lg"
            className="ring-4 ring-green-500 ring-opacity-50"
          />
        </div>
      </div>

      {/* Clickable Avatars */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Interactive</h3>
        <div className="flex items-center space-x-4">
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="Clickable"
            size="lg"
            className="cursor-pointer hover:ring-4 hover:ring-blue-300 transition-all duration-200"
            onClick={() => toast.info("Avatar clicked!")}
          />
          <CircleAvatar
            src="/api/placeholder/150/150"
            alt="Hover effect"
            size="lg"
            className="cursor-pointer transform hover:scale-110 transition-transform duration-200"
          />
        </div>
      </div>
    </div>
  );
};
