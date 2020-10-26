import dotenv from 'dotenv'

export function useEnv() {
  const result = dotenv.config()
  if (result.error) {
    throw result.error
  }
}