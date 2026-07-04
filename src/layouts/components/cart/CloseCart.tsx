import { FaXmark } from "react-icons/fa6";

export default function CloseCart({ className }: { className?: string }) {
  return (
    <div className="relative text-black transition-colors  ">
      <FaXmark
        className={`h-6 transition-all ease-in-out ${className || ""}`}
      />
    </div>
  );
}
