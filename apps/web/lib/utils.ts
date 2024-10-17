import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to generate a username from an OAuth profile name
export const generateUsername = (name: string): string => {
  if (!name) return `user_${generateRandomNumber(6)}`

  let username = name.toLowerCase().replace(/([^a-z0-9]|\+)/g, '_')

  if (username.length < 10) {
    username += `_${generateRandomNumber(7)}`
  }

  if (username.length > 20) {
    username = username.substring(0, 20)
  }

  return username
}

// Function to generate a random number
export const generateRandomNumber = (length: number): string => {
  return Math.random().toString(10).substring(2, length)
}
