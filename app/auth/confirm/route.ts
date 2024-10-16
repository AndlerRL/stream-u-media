import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams: reqSearchParams } = new URL(request.url)
  const token = reqSearchParams.get('token') ?? ''
  const email = reqSearchParams.get('email') ?? ''
  const type = reqSearchParams.get('type') as EmailOtpType | null
  const next = reqSearchParams.get('redirect_to') ?? '/'

  console.log('reqSearchParams -> ', reqSearchParams.toString())

  if (token && type) {
    const supabase = createClient()

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      type,
      token,
      // token_hash,
      email,
    })

    session!.user.user_metadata.avatar = `https://api.dicebear.com/9.x/adventurer/svg?seed=${session!.user.email}`
    const sanitizedEmail = session!.user.email!.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
    session!.user.user_metadata.username = generateUsername(sanitizedEmail)

    console.log('Session created! 🔑 ', session)

    await supabase.auth.updateUser({
      data: session!.user.user_metadata,
    })

    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error')
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