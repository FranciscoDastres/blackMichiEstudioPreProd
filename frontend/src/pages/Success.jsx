// Success.jsx
import { useNavigate } from "react-router-dom";

export default function Success({ message, actionText, actionTo }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background">
      <div className="bg-green-100 rounded-xl p-8 shadow text-center border border-green-200">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-700 mb-4">{message || "¡Acción exitosa!"}</h2>
        {actionText && actionTo && (
          <button
            onClick={() => navigate(actionTo)}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}