import loginVisual from "@/assets/login-visual.jpg";

/** Landing hero visual — real ATL collaboration artwork. */
export function LoginVisual() {
  return (
    <img
      src={loginVisual}
      alt="Students collaborating on innovation and technology projects"
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  );
}
