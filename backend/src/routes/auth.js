import bcrypt from 'bcryptjs'

/**
 * 认证相关路由
 * @param {object} fastify - Fastify 实例
 * @param {object} prisma - Prisma Client 实例
 * @param {boolean} isDev - 是否开发模式
 */
export default async function authRoutes(fastify, prisma, isDev) {
  const authMiddleware = isDev ? [] : [authenticate]

  // 认证中间件
  async function authenticate(request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  }

  // 注册
  fastify.post('/api/auth/register', async (request, reply) => {
    const { username, password } = request.body

    if (!username || !password) {
      return reply.code(400).send({ error: 'Username and password required' })
    }

    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) {
      return reply.code(400).send({ error: 'Username already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { username, passwordHash }
    })

    const token = fastify.jwt.sign({ userId: user.id, username: user.username })

    return { token, user: { id: user.id, username: user.username } }
  })

  // 登录
  fastify.post('/api/auth/login', async (request, reply) => {
    const { username, password } = request.body

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }

    const token = fastify.jwt.sign({ userId: user.id, username: user.username })

    return { token, user: { id: user.id, username: user.username } }
  })

  // 获取当前用户信息
  fastify.get('/api/auth/me', { onRequest: authMiddleware }, async (request) => {
    const userId = request.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    return { id: user.id, username: user.username }
  })

  return { authenticate }
}
