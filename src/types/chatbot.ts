export type ButtonConfig = {
  id: string;
  label: string;
  url: string;
};

export type ChatbotSettings = {
  bot_name: string;
  greeting_message: string;
  training_data: string;
  buttons: ButtonConfig[];
};