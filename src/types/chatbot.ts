export type Message = {
  role: "user" | "assistant" | "owner";  // Add "owner" to the role type
  content: string;
};