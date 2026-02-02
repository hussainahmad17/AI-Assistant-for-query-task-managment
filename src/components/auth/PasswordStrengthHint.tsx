
import React from "react";

const strengthColor = (score: number) => {
  if (score > 3) return "text-green-600";
  if (score > 2) return "text-yellow-600";
  if (score > 1) return "text-orange-600";
  return "text-red-600";
};

function getPasswordScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export const PasswordStrengthHint: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;
  const score = getPasswordScore(password);
  let label: string;
  if (score > 3) label = "Strong";
  else if (score > 2) label = "Medium";
  else label = "Weak";

  return (
    <span className={`text-xs font-medium ${strengthColor(score)}`}>
      Password strength: {label}
    </span>
  );
};
