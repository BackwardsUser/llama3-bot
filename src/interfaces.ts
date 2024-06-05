import { Message } from "ollama";

export interface botMemory {
  guildID: string
  messages: Message[]
}