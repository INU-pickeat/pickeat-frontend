export default function Button({ children, onClick, className = "", type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-10 bg-[#FF9639] text-white font-bold text-[14px] rounded-full shadow-lg shadow-orange-500/30 active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed transition-transform flex justify-center items-center ${className} cursor-pointer`}
    >
      {children}
    </button>
  );
}
