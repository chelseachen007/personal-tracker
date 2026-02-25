/**
 * 认证相关路由 - 通过 SSO 服务验证
 * 不再处理本地登录/注册，只验证 SSO token
 */

const SSO_SERVER_URL = process.env.SSO_SERVER_URL || 'http://localhost:3002'

/**
 * 认证相关路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {boolean} isDev - 是否开发模式
 */
export default async function authRoutes(fastify, prisma, isDev) {

  // 认证中间件 - 通过 SSO 验证 token
  async function authenticate(request, reply) {
    const token = request.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return reply.code(401).send({ error: 'No token provided' })
    }

    try {
      // 调用 SSO 服务验证 token
      const response = await fetch(`${SSO_SERVER_URL}/api/token/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      const result = await response.json()

      if (!result.valid) {
        return reply.code(401).send({ error: result.error || 'Invalid token' })
      }

      // 将用户信息附加到 request
      request.user = result.user
      return

    } catch (err) {
      fastify.log.error('SSO token verification failed:', err)

      // 如果 SSO 服务不可用，开发模式下使用默认用户
      if (isDev) {
        request.user = { userId: 1, uuid: 'dev-user', username: 'dev' }
        return
      }

      return reply.code(503).send({ error: 'SSO service unavailable' })
    }
  }

  // 获取当前用户信息（从 SSO 获取）
  fastify.get('/api/auth/me', { onRequest: isDev ? [] : [authenticate] }, async (request) => {
    if (isDev && !request.user) {
      request.user = { userId: 1 }
    }

    const userId = request.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      // 如果本地没有用户，返回 SSO 用户信息
      return {
        id: request.user.userId,
        uuid: request.user.uuid,
        username: request.user.username,
        email: request.user.email,
        displayName: request.user.displayName
      }
    }

    return { id: user.id, username: user.username }
  })

  // 获取 SSO 登录 URL
  fastify.get('/api/auth/sso-url', async (request) => {
    const { redirect_uri, provider } = request.query

    let authorizeUrl
    if (provider === 'github') {
      const response = await fetch(`${SSO_SERVER_URL}/api/oauth/github?redirect_uri=${encodeURIComponent(redirect_uri || '')}`)
      const data = await response.json()
      authorizeUrl = data.authorizeUrl
    } else if (provider === 'google') {
      const response = await fetch(`${SSO_SERVER_URL}/api/oauth/google?redirect_uri=${encodeURIComponent(redirect_uri || '')}`)
      const data = await response.json()
      authorizeUrl = data.authorizeUrl
    } else {
      // 默认返回 SSO 登录页面 URL
      authorizeUrl = `${SSO_SERVER_URL}/login?redirect_uri=${encodeURIComponent(redirect_uri || '')}`
    }

    return { authorizeUrl }
  })

  // 本地登录接口 - 转发到 SSO
  fastify.post('/api/auth/login', async (request, reply) => {
    const { username, email, password } = request.body

    try {
      const response = await fetch(`${SSO_SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })

      const result = await response.json()

      if (!response.ok) {
        return reply.code(response.status).send(result)
      }

      return result

    } catch (err) {
      fastify.log.error('SSO login failed:', err)

      // 开发模式下提供备用登录
      if (isDev) {
        const user = await prisma.user.findFirst()
        if (user) {
          return {
            token: 'dev-token',
            user: { id: user.id, username: user.username }
          }
        }
      }

      return reply.code(503).send({ error: 'SSO service unavailable' })
    }
  })

  // 本地注册接口 - 转发到 SSO
  fastify.post('/api/auth/register', async (request, reply) => {
    const { username, email, password } = request.body

    try {
      const response = await fetch(`${SSO_SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })

      const result = await response.json()

      if (!response.ok) {
        return reply.code(response.status).send(result)
      }

      // 在本地数据库创建用户记录（用于关联本地数据）
      const ssoUser = result.user
      await prisma.user.upsert({
        where: { id: ssoUser.id },
        create: {
          id: ssoUser.id,
          username: ssoUser.username || ssoUser.email?.split('@')[0] || `user_${ssoUser.id}`,
          passwordHash: '' // 密码由 SSO 管理
        },
        update: {
          username: ssoUser.username || ssoUser.email?.split('@')[0] || `user_${ssoUser.id}`
        }
      })

      return result

    } catch (err) {
      fastify.log.error('SSO register failed:', err)

      if (isDev) {
        // 开发模式下创建本地用户
        const existingUser = await prisma.user.findFirst()
        if (existingUser) {
          return {
            token: 'dev-token',
            user: { id: existingUser.id, username: existingUser.username }
          }
        }
      }

      return reply.code(503).send({ error: 'SSO service unavailable' })
    }
  })

  return { authenticate }
}
