export default function Home() {
  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/background-image.png')" }}
    >
      <div className="w-full max-w-5xl min-h-[600px] bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center p-8">
        
      </div>
      <img 
        src="/console.png" 
        alt="Console" 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 object-contain"
      />
    </div>
  );
}
