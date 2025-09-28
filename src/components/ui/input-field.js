import { Eye, EyeOff, AlertCircle } from "lucide-react";

export const InputField = ({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error = null,
  name = "",
  showPassword,
  onTogglePassword,
}) => (
  <div className="space-y-2">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon size={20} className={error ? "text-red-400" : "text-gray-400"} />
      </div>
      <input
        type={type === "password" && showPassword ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        name={name}
        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
          error
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-200 hover:border-gray-300 focus:ring-orange-500 focus:border-orange-500"
        }`}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          {showPassword ? (
            <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye size={20} className="text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
    </div>
    {error && (
      <div className="flex items-center space-x-2 text-red-600 text-sm">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    )}
  </div>
);
