import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'video_ia_user',
  password: process.env.DB_PASSWORD || 'video123',
  ssl: false
})

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Credentials manquantes')
          return null
        }

        try {
          console.log('Tentative de connexion pour:', credentials.email)
          
          // Check if user exists
          const result = await pool.query(
            'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
            [credentials.email]
          )

          if (result.rows.length === 0) {
            console.log('Utilisateur non trouvé ou inactif:', credentials.email)
            return null
          }

          const user = result.rows[0]
          console.log('Utilisateur trouvé:', user.email, 'Rôle:', user.role)

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isValidPassword) {
            console.log('Mot de passe incorrect pour:', credentials.email)
            return null
          }

          console.log('Authentification réussie pour:', credentials.email)

          // Update last login
          await pool.query(
            'UPDATE admin_users SET last_login_at = NOW() WHERE id = $1',
            [user.id]
          )

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar_url
          }
        } catch (error) {
          console.error('Erreur d\'authentification:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production'
}
