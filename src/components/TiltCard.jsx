// TiltCard: a card that tilts in 3D toward the pointer, with a moving light glare.
// Use it like: <TiltCard as={Link} to="/explore" className="card">...</TiltCard>
import { useRef } from "react";

export default function TiltCard({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);

  function handleMove(e) {
    if (e.pointerType === "touch") return; // no tilt on phones
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(700px) rotateX(${(-y * 10).toFixed(2)}deg) ` +
      `rotateY(${(x * 12).toFixed(2)}deg) translateY(-4px)`;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <Tag
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      {...rest}
    >
      {children}
    </Tag>
  );
}