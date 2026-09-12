import { Link } from "react-router-dom";
import "./ToolCard.css";

export default function ToolCard({ tool }) {
  const isAvailable = tool.status === "available";

  const content = (
    <>
      <div className="tool-card__icon" aria-hidden="true">{tool.icon}</div>
      <h3 className="tool-card__name">{tool.name}</h3>
      <p className="tool-card__description">{tool.description}</p>
      <span className={"badge" + (isAvailable ? "" : " badge--muted")}>
        {isAvailable ? "Available now" : "Coming soon"}
      </span>
    </>
  );

  if (isAvailable) {
    return (
      <Link to={tool.to} className="tool-card tool-card--link card">
        {content}
      </Link>
    );
  }

  return (
    <div className="tool-card card" aria-disabled="true">
      {content}
    </div>
  );
}
