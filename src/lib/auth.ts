import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export interface AuthenticatedUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    preferred_username?: string;
    avatar_url?: string;
  };
}

/**
 * Validates a Bearer token or Guest ID.
 * Returns the resolved User details or defaults to a bootstrap demo profile.
 */
export async function authenticateUser(req: NextRequest): Promise<AuthenticatedUser> {
  try {
    const authHeader = req.headers.get('Authorization');
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 1. Guest/Demo flow
    if (token && token.startsWith('guest_')) {
      return {
        id: token,
        email: `${token}@byteacademy.com`,
        user_metadata: {
          full_name: 'Guest Developer',
          preferred_username: token,
          avatar_url: '🤖'
        }
      };
    }

    // 2. Fallback to default demo user if config or token is missing
    if (!token || !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
      return {
        id: 'demo_user',
        email: 'demo@byteacademy.com',
        user_metadata: {
          full_name: 'Demo Developer',
          preferred_username: 'demo_developer',
          avatar_url: '💻'
        }
      };
    }

    // 3. Supabase Auth validation
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user || !user.email) {
      return {
        id: 'demo_user',
        email: 'demo@byteacademy.com',
        user_metadata: {
          full_name: 'Demo Developer',
          preferred_username: 'demo_developer',
          avatar_url: '💻'
        }
      };
    }

    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        full_name: user.user_metadata?.full_name,
        preferred_username: user.user_metadata?.preferred_username || user.user_metadata?.user_name,
        avatar_url: user.user_metadata?.avatar_url
      }
    };
  } catch (err) {
    console.error('Authentication check failure, falling back to demo user:', err);
    return {
      id: 'demo_user',
      email: 'demo@byteacademy.com',
      user_metadata: {
        full_name: 'Demo Developer',
        preferred_username: 'demo_developer',
        avatar_url: '💻'
      }
    };
  }
}
