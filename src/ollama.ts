import ollama, { Message } from "ollama";

export async function getResponse(guildMessages: Message[]) {
  console.log("Probing ollama API...")
  const response =  await ollama.chat({
    model: 'llama3',
    messages: guildMessages
  });
  console.log("Response received, sending to bot.")
  return response.message.content;
}