import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useExpenseContext } from "./Context";

export default function PasswordInput() {
    const {password, setPassword} = useExpenseContext();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        className="inputElement pr-10 mb-2" // Add padding-right for the eye icon
        type={showPassword ? "text" : "password"} // Toggle type between text and password
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div
        className="absolute right-2 top-4 cursor-pointer text-gray-500"
        onClick={() => setShowPassword(!showPassword)} // Toggle visibility
      >
        {showPassword ? (
          <AiOutlineEyeInvisible size={20} /> // Eye-off icon
        ) : (
          <AiOutlineEye size={20} /> // Eye icon
        )}
      </div>
    </div>
  );
}
