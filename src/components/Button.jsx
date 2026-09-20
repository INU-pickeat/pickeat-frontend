export default function Button({ children, onClick, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full h-10 bg-[#FF9639] text-white font-bold text-[14px] rounded-full shadow-lg shadow-orange-500/30 active:scale-95 transition-transform flex justify-center items-center ${className} cursor-pointer`}
    >
      {children}
    </button>
  );
}
